-- Guard rail from day one: no table in the public schema may exist without
-- Row Level Security. With no tables yet this passes trivially, and from
-- Stage 2 onward it fails the build the moment a migration forgets RLS.
begin;
select plan(1);

select is(
  (
    select coalesce(string_agg(tablename, ', ' order by tablename), '')
    from pg_tables
    where schemaname = 'public' and not rowsecurity
  ),
  '',
  'every table in the public schema has row level security enabled'
);

select * from finish();
rollback;
