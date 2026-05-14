-- ============================================================
-- Kardovik — Clínicas e vínculo com usuário
-- ============================================================

-- ── Tabela clinicas ──────────────────────────────────────────
create table if not exists public.clinicas (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  slug       text unique,
  status     text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at automático (reutiliza função criada na migration 001)
create trigger clinicas_updated_at
  before update on public.clinicas
  for each row execute procedure public.set_updated_at();

-- ── Vínculo usuario → clínica ────────────────────────────────
-- role: owner | admin | dentista | atendente
alter table public.usuarios
  add column if not exists clinica_id uuid references public.clinicas(id) on delete set null,
  add column if not exists role       text default 'owner';

-- Índice para busca por clínica
create index if not exists usuarios_clinica_id_idx on public.usuarios (clinica_id);

-- ── RLS para clinicas ─────────────────────────────────────────
alter table public.clinicas enable row level security;

-- Usuários autenticados podem ler clínicas (filtragem na aplicação)
create policy "Authenticated users can read own clinic"
  on public.clinicas for select
  to authenticated
  using (
    exists (
      select 1
      from public.usuarios u
      where u.id = auth.uid()
        and u.clinica_id = clinicas.id
    )
  );

-- Usuários autenticados podem criar clínicas (primeiro acesso)
create policy "Authenticated users can create clinics"
  on public.clinicas for insert
  to authenticated
  with check (true);

-- ============================================================
-- FIM
-- ============================================================
