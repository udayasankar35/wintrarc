begin;
select plan(5);

select has_function(
  'public', 'health_ping', array[]::name[],
  'health_ping exists'
);

select function_returns(
  'public', 'health_ping', array[]::name[], 'timestamp with time zone',
  'health_ping returns timestamptz'
);

select isnt_definer(
  'public', 'health_ping', array[]::name[],
  'health_ping runs with the caller''s privileges, not the owner''s'
);

-- The public health route calls this with the publishable key, i.e. as anon.
set local role anon;

select lives_ok(
  $$ select public.health_ping() $$,
  'anon can call health_ping'
);

select ok(
  public.health_ping() between now() - interval '1 minute'
                           and now() + interval '1 minute',
  'health_ping returns the current database time'
);

select * from finish();
rollback;
