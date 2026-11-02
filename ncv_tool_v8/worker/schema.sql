create table if not exists testers (
  tester_id    text primary key,
  email        text,
  started_at   timestamptz not null default now(),
  start_answers jsonb not null default '{}'::jsonb,
  finished_at  timestamptz,
  end_answers  jsonb,
  profile      jsonb,
  last_step    text,
  tool_version text,
  user_agent   text
);
create index if not exists testers_started_idx on testers (started_at);
create or replace view tester_summary as
  select tester_id, email, started_at, finished_at, last_step,
         profile->>'field' as field, profile->>'stage' as stage,
         start_answers->>'funding' as funding, start_answers->>'before' as written_before,
         start_answers->>'want' as wants, end_answers->>'useful' as useful,
         end_answers->>'stuck' as stuck, end_answers->>'change' as change
  from testers order by started_at desc;
