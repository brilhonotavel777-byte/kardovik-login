-- ============================================================
-- Kardovik — Controle de acesso e billing
-- ============================================================

-- Adicionar colunas caso não existam (safe para reexecução)
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS billing_status      TEXT        DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS access_expires_at   TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days';

-- Liberar acesso de teste para o usuário administrador
UPDATE public.usuarios
SET
  billing_status    = 'paid',
  access_expires_at = NOW() + INTERVAL '365 days'
WHERE email = 'brilhonotavel@hotmail.com';

-- Garantir consistência: nenhum usuário com status NULL
UPDATE public.usuarios
SET status = 'active'
WHERE status IS NULL;
