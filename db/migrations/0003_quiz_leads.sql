-- Leads captured by the quiz. Separate from `entitlements` on purpose: a lead
-- is someone who answered questions and agreed to hear from us, not a buyer.
create table if not exists quiz_leads (
  id          uuid primary key default gen_random_uuid(),
  email       citext,
  locale      text not null,
  segment     text not null,
  answers     jsonb not null,
  consented   boolean not null default false,
  user_agent  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One row per e-mail: retaking the quiz updates the segment instead of piling
-- up duplicates. Rows with no e-mail (the skip path) are anonymous and are not
-- deduplicated, because there is nothing to deduplicate on.
create unique index if not exists quiz_leads_email_key on quiz_leads (email) where email is not null;
create index if not exists quiz_leads_segment_idx on quiz_leads (segment);

drop trigger if exists quiz_leads_set_updated_at on quiz_leads;
create trigger quiz_leads_set_updated_at before update on quiz_leads
  for each row execute function set_updated_at();
