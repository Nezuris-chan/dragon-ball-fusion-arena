-- Keep internal match tables inaccessible to browser roles while documenting the
-- service-role-only access path used by the authenticated online-match Edge Function.
create policy "Service role manages ranked matches"
on public.online_matches for all to service_role using (true) with check (true);

create policy "Service role manages AI reward ledger"
on public.ai_ranked_rewards for all to service_role using (true) with check (true);
