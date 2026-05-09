-- ===================================================
-- PSS Evaluation Platform - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ===================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ===================================================
-- Table: cases (previously "patients")
-- ===================================================
create table if not exists public.cases (
  id            uuid primary key default uuid_generate_v4(),
  child_name    text not null,
  age           int  not null check (age >= 1 and age <= 18),
  gender        text not null check (gender in ('ذكر', 'أنثى')),
  address       text,
  phone         text,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz default now()
);

-- ===================================================
-- Table: evaluations
-- ===================================================
create table if not exists public.evaluations (
  id               uuid primary key default uuid_generate_v4(),
  case_id          uuid not null references public.cases(id) on delete cascade,
  scale_id         text not null,            -- 'q1' through 'q9'
  therapist_name   text not null,
  evaluation_date  date not null default current_date,
  score            int  not null,
  risk_level       text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  answers          jsonb,                     -- { fieldName: value, ... }
  notes            text,
  created_by       uuid references auth.users(id) on delete set null,
  created_at       timestamptz default now()
);

-- ===================================================
-- Row Level Security (RLS)
-- ===================================================

alter table public.cases       enable row level security;
alter table public.evaluations enable row level security;

-- Cases: authenticated users can read/write their own rows
create policy "Authenticated users can insert cases"
  on public.cases for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Authenticated users can read all cases"
  on public.cases for select
  to authenticated
  using (true);  -- All therapists share case data

create policy "Creators can update their cases"
  on public.cases for update
  to authenticated
  using (auth.uid() = created_by);

-- Evaluations: same pattern
create policy "Authenticated users can insert evaluations"
  on public.evaluations for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Authenticated users can read all evaluations"
  on public.evaluations for select
  to authenticated
  using (true);

create policy "Creators can update their evaluations"
  on public.evaluations for update
  to authenticated
  using (auth.uid() = created_by);

-- ===================================================
-- Indexes for performance
-- ===================================================
create index if not exists idx_evaluations_case_id   on public.evaluations(case_id);
create index if not exists idx_evaluations_scale_id  on public.evaluations(scale_id);
create index if not exists idx_evaluations_risk_level on public.evaluations(risk_level);
create index if not exists idx_cases_created_by      on public.cases(created_by);
