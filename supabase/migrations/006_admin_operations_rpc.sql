-- ── Admin Operations RPC ──────────────────────────────────────
-- SECURITY DEFINER: bypasses RLS to aggregate clinic/user data.
-- Access is gated internally: only role = 'owner' may call this.

create or replace function public.get_admin_operations()
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

  with clinica_stats as (
    select
      c.id,
      c.nome,
      c.slug,
      c.status,
      c.created_at,
      count(u.id)::int                                                         as total_usuarios,
      count(u.id) filter (where u.billing_status = 'paid')::int                as usuarios_pagos,
      max(u.updated_at)                                                         as ultimo_acesso,
      -- plano mais frequente entre os usuários da clínica
      (
        select u2.plano
        from   public.usuarios u2
        where  u2.clinica_id = c.id and u2.plano is not null
        group  by u2.plano
        order  by count(*) desc
        limit  1
      )                                                                         as plano_dominante,
      -- health score derivado de status + pagantes + recência de acesso
      case
        when c.status != 'active'
          then 20
        when count(u.id) filter (where u.billing_status = 'paid') = 0
          then 35
        when max(u.updated_at) is null
          or max(u.updated_at) < now() - interval '7 days'
          then 45
        when max(u.updated_at) < now() - interval '2 days'
          then 72
        else 91
      end                                                                       as health_score,
      -- status de exibição mapeado para o frontend
      case
        when c.status = 'inactive'
          then 'pausa'
        when c.created_at > now() - interval '7 days'
          then 'novo'
        when max(u.updated_at) is null
          or max(u.updated_at) < now() - interval '7 days'
          then 'risco'
        else 'ativo'
      end                                                                       as display_status
    from      public.clinicas  c
    left join public.usuarios  u on u.clinica_id = c.id
    group by  c.id, c.nome, c.slug, c.status, c.created_at
  )
  select jsonb_build_object(
    'total_clinicas',    (select count(*)::int from clinica_stats),
    'clinicas_ativas',   (select count(*)::int from clinica_stats where status = 'active'),
    'clinicas_inativas', (select count(*)::int from clinica_stats where status != 'active'),
    'clinicas', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id',                     cs.id,
            'nome',                   cs.nome,
            'slug',                   cs.slug,
            'status',                 cs.status,
            'created_at',             cs.created_at,
            'total_usuarios',         cs.total_usuarios,
            'usuarios_pagos',         cs.usuarios_pagos,
            'plano_dominante',        coalesce(cs.plano_dominante, 'mensal'),
            'ultimo_acesso_derivado', cs.ultimo_acesso,
            'health_score_derivado',  cs.health_score,
            'display_status',         cs.display_status
          )
          order by cs.health_score desc
        )
        from clinica_stats cs
      ),
      '[]'::jsonb
    ),
    'computed_at', now()
  ) into v_result;

  return v_result;
end;
$$;

revoke execute on function public.get_admin_operations() from public;
grant  execute on function public.get_admin_operations() to authenticated;
