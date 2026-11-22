-- Applied to the hosted project on 2026-11-21.
-- Ranked match mutations are now only callable by the verified Edge Function service role.
drop function if exists public.award_ai_victory();
drop function if exists public.register_online_match(uuid, uuid, uuid);
drop function if exists public.report_online_match(uuid, uuid);

drop policy if exists players_update_own_profile on public.profiles;
drop policy if exists "Chaque joueur crée son profil" on public.profiles;
drop policy if exists "Chaque joueur modifie son profil" on public.profiles;
create policy "Chaque joueur crée son profil" on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);
create policy "Chaque joueur modifie son profil" on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, username, xp, player_level) on public.profiles to authenticated;
grant update (username, xp, player_level) on public.profiles to authenticated;

create index if not exists ai_ranked_rewards_player_created_idx on public.ai_ranked_rewards (player_id, created_at);
create index if not exists match_results_player1_idx on public.match_results (player1);
create index if not exists match_results_player2_idx on public.match_results (player2);
create index if not exists match_results_winner_idx on public.match_results (winner);
create index if not exists online_matches_player1_idx on public.online_matches (player1);
create index if not exists online_matches_player2_idx on public.online_matches (player2);
create index if not exists online_matches_report1_idx on public.online_matches (report1);
create index if not exists online_matches_report2_idx on public.online_matches (report2);

create or replace function public.register_online_match_secure(p_match_id uuid,p_player1 uuid,p_player2 uuid,p_actor uuid)
returns void language plpgsql security definer set search_path=''
as $function$
begin
 if coalesce(auth.jwt()->>'role','') <> 'service_role' then raise exception 'Service endpoint required'; end if;
 if p_actor is null or p_actor <> p_player1 or p_player1 = p_player2 then raise exception 'Match non autorisé'; end if;
 insert into public.online_matches(id,player1,player2) values(p_match_id,p_player1,p_player2);
end;
$function$;

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
 update public.online_matches set awarded=true where id=p_match_id;
 return 'validated';
end;
$function$;
revoke all on function public.register_online_match_secure(uuid,uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function public.report_online_match_secure(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.register_online_match_secure(uuid,uuid,uuid,uuid) to service_role;
grant execute on function public.report_online_match_secure(uuid,uuid,uuid) to service_role;
