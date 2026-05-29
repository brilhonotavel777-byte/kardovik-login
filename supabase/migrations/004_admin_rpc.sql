-- ── Admin Stats RPC ────────────────────────────────────────────
-- SECURITY DEFINER: bypasses RLS to aggregate platform stats.
-- Access is gated internally: only role = 'owner' may call this.

create or replace function public.get_admin_stats()
returns jsonb
language plpgsql
security definer
stable
as $$
declare
  v_role   text;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  select role into v_role
  from public.usuarios
  where id = auth.uid();

  if v_role is distinct from 'owner' then
    raise exception 'Access denied: owner role required';
  end if;

  select jsonb_build_object(
    'clinicas_ativas',      (select count(*)::int from public.clinicas where status = 'active'),
    'clinicas_total',       (select count(*)::int from public.clinicas),
    'usuarios_pagos',       (select count(*)::int from public.usuarios where billing_status = 'paid' and status = 'active'),
    'novas_vendas_mes',     (select count(*)::int from public.usuarios where billing_status = 'paid' and created_at >= date_trunc('month', now())),
    'cancelamentos_mes',    (select count(*)::int from public.usuarios where billing_status in ('canceled', 'refunded') and updated_at >= date_trunc('month', now())),
    'acesso_expirando_7d',  (select count(*)::int from public.usuarios where billing_status = 'paid' and access_expires_at between now() and now() + interval '7 days'),
    'plano_anual',          (select count(*)::int from public.usuarios where plano = 'anual' and billing_status = 'paid'),
    'plano_mensal',         (select count(*)::int from public.usuarios where plano = 'mensal' and billing_status = 'paid'),
    'computed_at',          now()
  ) into v_result;

  return v_result;
end;
$$;

-- Revoke from public, grant only to authenticated users (role check is internal)
revoke execute on function public.get_admin_stats() from public;
grant  execute on function public.get_admin_stats() to authenticated;
