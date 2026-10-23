-- AgentMinder database. Paste this whole file into Supabase → SQL Editor → Run.
-- Safe to run more than once.

create extension if not exists pgcrypto;

-- Agents: one row per bot a customer monitors. The ingest key is stored only as a hash.
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  kind text not null default 'support',
  key_hash text not null unique,
  key_prefix text not null,
  slack_webhook text,
  created_at timestamptz not null default now()
);

-- Custom risk policies, written in plain English.
create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  rule text not null check (char_length(rule) between 3 and 300),
  severity text not null default 'high' check (severity in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);

-- Conversations captured by the proxy, the ingest API or a CSV upload.
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  owner uuid not null references auth.users(id) on delete cascade,
  external_id text not null,
  messages jsonb not null default '[]'::jsonb,
  model text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd numeric(12, 6) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'error')),
  resolved boolean,
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  summary text,
  review_error text,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, external_id)
);

-- Problems the reviewer found in a conversation.
create table if not exists public.flags (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  owner uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('risky_action', 'wrong_answer', 'data_leak', 'cost_spike', 'policy_breach', 'unresolved', 'off_topic')),
  severity text not null check (severity in ('low', 'medium', 'high')),
  quote text,
  explanation text not null,
  suggested_fix text,
  dismissed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Waitlist signups from the marketing site.
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null check (char_length(email) between 3 and 200),
  company text,
  plan text,
  created_at timestamptz not null default now()
);

create index if not exists conversations_agent_updated on public.conversations (agent_id, updated_at desc);
create index if not exists conversations_owner on public.conversations (owner);
create index if not exists flags_agent_created on public.flags (agent_id, created_at desc);
create index if not exists flags_conversation on public.flags (conversation_id);
create index if not exists flags_owner on public.flags (owner);
create index if not exists policies_agent on public.policies (agent_id);
create index if not exists policies_owner on public.policies (owner);
create index if not exists agents_owner on public.agents (owner);

-- Row level security: every customer sees only their own rows.
-- The backend uses the service-role key, which bypasses these rules.
alter table public.agents enable row level security;
alter table public.policies enable row level security;
alter table public.conversations enable row level security;
alter table public.flags enable row level security;
alter table public.waitlist enable row level security;

drop policy if exists "own agents" on public.agents;
create policy "own agents" on public.agents for all to authenticated
  using (owner = (select auth.uid())) with check (owner = (select auth.uid()));

drop policy if exists "own policies" on public.policies;
create policy "own policies" on public.policies for all to authenticated
  using (owner = (select auth.uid()))
  with check (owner = (select auth.uid()) and exists (select 1 from public.agents a where a.id = agent_id and a.owner = (select auth.uid())));

drop policy if exists "read own conversations" on public.conversations;
create policy "read own conversations" on public.conversations for select to authenticated
  using (owner = (select auth.uid()));
drop policy if exists "delete own conversations" on public.conversations;
create policy "delete own conversations" on public.conversations for delete to authenticated
  using (owner = (select auth.uid()));

drop policy if exists "read own flags" on public.flags;
create policy "read own flags" on public.flags for select to authenticated
  using (owner = (select auth.uid()));
drop policy if exists "dismiss own flags" on public.flags;
create policy "dismiss own flags" on public.flags for update to authenticated
  using (owner = (select auth.uid())) with check (owner = (select auth.uid()));

drop policy if exists "anyone can join the waitlist" on public.waitlist;
create policy "anyone can join the waitlist" on public.waitlist for insert to anon, authenticated
  with check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
