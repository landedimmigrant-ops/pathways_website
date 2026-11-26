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

-- V8.7 (2026-11-12): feedback notes, one row per note, sent from the "?" box at the foot of each step.
create table if not exists tester_notes (
  note_id      bigserial primary key,
  tester_id    text not null references testers (tester_id) on delete cascade,
  step         text not null,
  note         text not null,
  profile      jsonb,
  tool_version text,
  created_at   timestamptz not null default now()
);
create index if not exists tester_notes_tester_idx on tester_notes (tester_id);
drop view if exists notes_by_step;
create view notes_by_step as
  select n.created_at, n.step, t.email, n.profile->>'field' as field, n.profile->>'stage' as stage,
         n.profile->>'agency' as agency, n.tool_version, n.note
  from tester_notes n join testers t using (tester_id) order by n.step, n.created_at;
