-- ============================================================
-- Kardovik — Tabela de perfil + billing
-- Separada do auth.users do Supabase propositalmente.
-- auth.users cuida de identidade; esta tabela cuida de acesso.
-- ============================================================

create table if not exists public.usuarios (
  -- Chave principal sincronizada com auth.users.id
  id              uuid primary key references auth.users(id) on delete cascade,

  -- Identidade
  email           text,
  phone           text,
  nome            text,

  -- Controle de acesso
  -- Valores: "active" | "inactive" | "blocked" | "expired"
  status          text not null default 'inactive',

  -- Billing (fonte de verdade: Hotmart → webhook → esta tabela)
  -- Valores: "paid" | "pending" | "canceled" | "refunded" | "overdue"
  billing_status  text not null default 'pending',

  -- Plano contratado
  -- Exemplo: "anual", "mensal", "trial"
  plano           text,

  -- Referências do Hotmart (preenchidas via webhook)
  hotmart_product_id       text,
  hotmart_transaction_id   text,
  hotmart_subscriber_code  text,

  -- Expiração do acesso
  -- NULL = acesso não liberado até que o webhook defina uma data válida.
  -- O sistema só libera acesso quando access_expires_at contém uma data futura.
  access_expires_at  timestamptz,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Índices úteis para consultas do webhook
create index if not exists usuarios_hotmart_subscriber_code_idx
  on public.usuarios (hotmart_subscriber_code);

create index if not exists usuarios_email_idx
  on public.usuarios (email);

-- Atualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger usuarios_updated_at
  before update on public.usuarios
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Row Level Security
-- O próprio usuário lê/edita apenas seu registro.
-- O webhook do Hotmart usa service_role key (bypassa RLS).
-- ============================================================

alter table public.usuarios enable row level security;

create policy "Usuário lê seu próprio perfil"
  on public.usuarios for select
  using (auth.uid() = id);

create policy "Usuário atualiza seu próprio perfil"
  on public.usuarios for update
  using (auth.uid() = id);

-- ============================================================
-- Trigger: cria perfil inicial ao registrar no auth
-- ============================================================

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.usuarios (id, email, phone, status, billing_status)
  values (
    new.id,
    new.email,
    new.phone,
    'inactive',
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();
