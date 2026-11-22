-- Reconstructed from the live production grants for migration-history parity.
-- The earlier secure_progress_code migration already creates the policy and RPC.
revoke all on table public.progress_code_redemptions from public, anon, authenticated;
grant insert on table public.progress_code_redemptions to authenticated;
revoke all on function public.redeem_progress_code(text) from public, anon;
grant execute on function public.redeem_progress_code(text) to authenticated;
