-- Tracks which automated e-mails were sent to which address, so the
-- onboarding sequence (and any future campaign) is sent at most once.
create table if not exists email_log (
  id         bigint generated always as identity primary key,
  email      citext not null,
  template   text not null,
  sent_at    timestamptz not null default now(),
  unique (email, template)
);
