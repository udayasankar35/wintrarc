-- Health check used by /api/health and the keep-alive jobs.
--
-- It returns the database clock and reads no table, so it exposes no user data.
-- Calling it is a real round trip to Postgres, which counts as project activity
-- and keeps a free Supabase project from being paused for inactivity.
create or replace function public.health_ping()
returns timestamptz
language sql
stable
security invoker
set search_path = ''
as $$
  select now();
$$;

comment on function public.health_ping() is
  'Returns the database clock. Used for health checks and keep-alive pings.';

revoke all on function public.health_ping() from public;
grant execute on function public.health_ping() to anon, authenticated, service_role;
