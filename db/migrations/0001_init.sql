-- Honey Protocol — initial schema (Postgres 14+)
-- Applied by `npm run db:migrate` (see scripts/migrate.ts).

create extension if not exists citext;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users: one row per person who signed in at least once
-- ---------------------------------------------------------------------------
create table if not exists users (
  id                uuid primary key default gen_random_uuid(),
  email             citext not null unique,
  display_name      text,
  locale            text not null default 'pt',
  timezone          text,
  onboarded_at      timestamptz,
  reminder_opt_in   boolean not null default true,
  last_reminder_day date,
  last_login_at     timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- entitlements: who is allowed into the app (one row per buyer e-mail)
-- ---------------------------------------------------------------------------
create table if not exists entitlements (
  id                uuid primary key default gen_random_uuid(),
  email             citext not null unique,
  status            text not null check (status in ('active', 'revoked')),
  source            text not null default 'hotmart',
  product_id        text,
  transaction       text,
  locale            text,
  country           text,
  buyer_name        text,
  granted_at        timestamptz not null default now(),
  revoked_at        timestamptz,
  revoke_reason     text,
  last_link_sent_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists entitlements_transaction_idx on entitlements (transaction);

-- ---------------------------------------------------------------------------
-- login_tokens: single-use magic-link tokens (only the hash is stored)
-- ---------------------------------------------------------------------------
create table if not exists login_tokens (
  id          uuid primary key default gen_random_uuid(),
  email       citext not null,
  token_hash  text not null unique,
  kind        text not null check (kind in ('welcome', 'login')),
  next_path   text not null default '/app',
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists login_tokens_email_idx on login_tokens (email);

-- ---------------------------------------------------------------------------
-- ritual_days: one row per user per local calendar day
-- ---------------------------------------------------------------------------
create table if not exists ritual_days (
  user_id    uuid not null references users (id) on delete cascade,
  day        date not null,
  water      boolean not null default false,
  honey      boolean not null default false,
  screen_off boolean not null default false,
  honey_at   timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- ---------------------------------------------------------------------------
-- consents: LGPD/GDPR consent log (terms, privacy, marketing, reminders)
-- ---------------------------------------------------------------------------
create table if not exists consents (
  id         bigint generated always as identity primary key,
  user_id    uuid references users (id) on delete set null,
  email      citext,
  kind       text not null,
  version    text not null,
  granted    boolean not null,
  locale     text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists consents_user_id_idx on consents (user_id);

-- ---------------------------------------------------------------------------
-- webhook_events: raw log of every webhook received (idempotency + audit)
-- ---------------------------------------------------------------------------
create table if not exists webhook_events (
  id           bigint generated always as identity primary key,
  provider     text not null,
  event_id     text not null,
  event        text not null,
  transaction  text,
  payload      jsonb not null,
  processed_at timestamptz,
  error        text,
  received_at  timestamptz not null default now(),
  unique (provider, event_id)
);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at before update on users
  for each row execute function set_updated_at();

drop trigger if exists entitlements_set_updated_at on entitlements;
create trigger entitlements_set_updated_at before update on entitlements
  for each row execute function set_updated_at();

drop trigger if exists ritual_days_set_updated_at on ritual_days;
create trigger ritual_days_set_updated_at before update on ritual_days
  for each row execute function set_updated_at();
