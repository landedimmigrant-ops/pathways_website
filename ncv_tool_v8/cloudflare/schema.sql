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
-- The view follows the 2026-11-03 questions. Rows sent with the first set keep their answers in the
-- jsonb columns (funding, before, want, useful, stuck); read those with start_answers / end_answers.
drop view if exists tester_summary;
create view tester_summary as
  select tester_id, email, started_at, finished_at, last_step,
         round(extract(epoch from (finished_at - started_at)) / 60) as minutes,
         profile->>'agency' as agency, profile->>'field' as field, profile->>'stage' as stage,
         start_answers->>'source' as starting_from, start_answers->>'due' as due,
         start_answers->>'concern' as concern, end_answers->>'concernHelp' as concern_help,
         end_answers->>'fit' as fit, end_answers->>'fitWhich' as fit_which,
         end_answers->>'next' as next_step,
         (select string_agg(x, '; ') from jsonb_array_elements_text(coalesce(end_answers->'reuse', '[]'::jsonb)) x) as reuse,
         end_answers->>'reuseOther' as reuse_other, end_answers->>'change' as change
  from testers order by started_at desc;
