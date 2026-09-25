-- Restrict trigger-only SECURITY DEFINER function from API callers.
-- Trigger execution remains available to Postgres/Auth internals.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
