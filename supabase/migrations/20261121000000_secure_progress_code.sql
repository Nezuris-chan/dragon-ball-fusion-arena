-- Secure, one-time redemption for the Fusion Arena progression code.
-- The RPC runs as invoker; RLS permits only an authenticated user to insert
-- a redemption row for their own auth.uid().
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.progress_code_redemptions (
  user_id uuid not null references auth.users(id) on delete cascade,
  code_id text not null,
  redeemed_at timestamptz not null default now(),
  primary key (user_id, code_id)
);

alter table public.progress_code_redemptions enable row level security;
revoke all on public.progress_code_redemptions from anon, authenticated;

create policy "Users can redeem their own progression code"
on public.progress_code_redemptions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

grant insert on public.progress_code_redemptions to authenticated;

create or replace function public.redeem_progress_code(p_code text)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_code_id constant text := 'fusion-before-super';
  v_expected_digest constant text := '67669e409e28b0ae9710c99f77cb77510214b8c77c7c34ace3961755de3700fc';
  v_rows integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if encode(extensions.digest(upper(trim(coalesce(p_code, ''))), 'sha256'), 'hex') <> v_expected_digest then
    return jsonb_build_object('status', 'invalid_code');
  end if;

  insert into public.progress_code_redemptions (user_id, code_id)
  values (v_user_id, v_code_id)
  on conflict (user_id, code_id) do nothing;

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    return jsonb_build_object('status', 'already_redeemed');
  end if;

  return jsonb_build_object('status', 'accepted');
end;
$$;

revoke all on function public.redeem_progress_code(text) from public, anon;
grant execute on function public.redeem_progress_code(text) to authenticated;
