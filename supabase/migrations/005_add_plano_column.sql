ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS plano text DEFAULT 'mensal';
