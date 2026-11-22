-- Server-controlled online progression. Local story/adventure XP remains local
-- until those game modes can be authoritatively verified by the server.
alter table public.profiles
  add column if not exists verified_xp bigint not null default 0,
  add column if not exists verified_level integer not null default 1;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_verified_progression_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_verified_progression_check
      check (verified_xp >= 0 and verified_level between 1 and 100);
  end if;
end
$$;

create table if not exists public.progression_xp_ledger (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null,
  source text not null check (source in ('ranked_match_winner', 'ranked_match_participation')),
  xp_delta integer not null check (xp_delta > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, event_key)
);

alter table public.progression_xp_ledger enable row level security;
revoke all on public.progression_xp_ledger from public, anon, authenticated;
grant all on public.progression_xp_ledger to service_role;

revoke insert, update on table public.profiles from anon, authenticated;
revoke insert (id, username, xp, player_level),
       update (username, xp, player_level)
  on table public.profiles from anon, authenticated;
grant insert (id, username) on table public.profiles to authenticated;
grant update (username) on table public.profiles to authenticated;
grant select (verified_xp, verified_level) on table public.profiles to anon, authenticated;

drop policy if exists "Service role manages AI reward ledger" on public.ai_ranked_rewards;
drop policy if exists "Service role manages ranked matches" on public.online_matches;

create or replace function public.report_online_match_secure(p_match_id uuid,p_winner uuid,p_actor uuid)
returns text language plpgsql security definer set search_path=''
as $function$
declare m public.online_matches%rowtype; loser uuid;
begin
 if coalesce(auth.jwt()->>'role','') <> 'service_role' then raise exception 'Service endpoint required'; end if;
 select * into m from public.online_matches where id=p_match_id for update;
 if not found or p_actor is null or p_actor not in (m.player1,m.player2) then raise exception 'Match introuvable ou accès refusé'; end if;
 if p_winner not in (m.player1,m.player2) then raise exception 'Vainqueur invalide'; end if;
 if m.awarded then return 'already_awarded'; end if;
 if p_actor=m.player1 then
  if m.report1 is not null and m.report1<>p_winner then raise exception 'Résultat déjà envoyé par ce joueur'; end if;
  update public.online_matches set report1=p_winner where id=p_match_id;
 else
  if m.report2 is not null and m.report2<>p_winner then raise exception 'Résultat déjà envoyé par ce joueur'; end if;
  update public.online_matches set report2=p_winner where id=p_match_id;
 end if;
 select * into m from public.online_matches where id=p_match_id for update;
 if m.report1 is null or m.report2 is null then return 'waiting_for_opponent'; end if;
 if m.report1<>m.report2 then return 'reports_disagree'; end if;
 loser:=case when m.report1=m.player1 then m.player2 else m.player1 end;
 update public.profiles set rating=rating+25,wins=wins+1 where id=m.report1;
 update public.profiles set rating=greatest(0,rating-15),losses=losses+1 where id=loser;
 insert into public.progression_xp_ledger(user_id,event_key,source,xp_delta)
 values (m.report1,p_match_id::text||':winner','ranked_match_winner',100),
        (loser,p_match_id::text||':participant','ranked_match_participation',50)
 on conflict (user_id,event_key) do nothing;
 update public.profiles as p set verified_xp=p.verified_xp+100,
  verified_level=least(100,(1+floor((sqrt(1+8*((p.verified_xp+100)::numeric/250))-1)/2))::integer)
 where p.id=m.report1;
 update public.profiles as p set verified_xp=p.verified_xp+50,
  verified_level=least(100,(1+floor((sqrt(1+8*((p.verified_xp+50)::numeric/250))-1)/2))::integer)
 where p.id=loser;
 update public.online_matches set awarded=true where id=p_match_id;
 return 'validated';
end;
$function$;

revoke all on function public.report_online_match_secure(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.report_online_match_secure(uuid,uuid,uuid) to service_role;
