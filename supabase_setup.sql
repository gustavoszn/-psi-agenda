-- ============================================================
-- PSI AGENDA — Setup do banco de dados (Supabase SQL Editor)
-- ============================================================

-- TABELAS
create table if not exists patients (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  email      text,
  phone      text,
  whatsapp   text,
  cpf        text,
  birth_date date,
  address    text,
  number     text,
  cep        text,
  notes      text,
  status     text not null default 'active' check (status in ('active', 'inactive')),
  photo      text,
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  patient_id   uuid not null references patients(id) on delete cascade,
  date         timestamptz not null,
  duration     int not null default 50,
  modality     text not null default 'presencial' check (modality in ('presencial', 'online')),
  meeting_link text,
  status       text not null default 'scheduled' check (status in ('scheduled', 'confirmed', 'done', 'cancelled', 'rescheduled', 'missed')),
  notes        text,
  created_at   timestamptz not null default now()
);

create table if not exists settings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ÍNDICES
create index if not exists idx_patients_user_id        on patients(user_id);
create index if not exists idx_appointments_user_id    on appointments(user_id);
create index if not exists idx_appointments_patient_id on appointments(patient_id);
create index if not exists idx_appointments_date       on appointments(date);

-- RLS
alter table patients     enable row level security;
alter table appointments enable row level security;
alter table settings     enable row level security;

do $$ begin
  create policy "own" on patients     using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own" on appointments using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own" on settings     using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
