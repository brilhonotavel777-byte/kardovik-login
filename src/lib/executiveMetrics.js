// ── Executive Metrics Service ─────────────────────────────────
//
// Fonte única de dados financeiros do Comando Executivo.
//
// HOJE: retorna estrutura vazia. Nenhuma chamada de rede.
//       Todos os cards mostram "Aguardando dados" por design.
//
// QUANDO CONECTAR GATEWAY DE PAGAMENTO:
//   substituir o corpo de fetchExecutiveMetrics() por uma chamada
//   à Vercel Function /api/executive-metrics, que por sua vez
//   consulta o provider ativo (Asaas ou Stripe).
//
// NÃO conectar diretamente ao provider aqui —
// segredos ficam em process.env nas Vercel Functions, nunca no browser.

// ── Shape dos dados financeiros ───────────────────────────────

export const EXECUTIVE_METRICS_UNAVAILABLE = {
  // ── Receita ─────────────────────────────────────────────────
  //
  // FUTURO (Asaas):
  //   GET /api/v3/payments?status=RECEIVED&dateCreatedGte=<hoje>
  //   Agrupado por dia/semana/mês no lado do servidor.
  //
  // FUTURO (Stripe):
  //   GET /v1/balance_transactions?type=payment&created[gte]=<unix>
  //   Agrupado por intervalo no lado do servidor.
  //
  revenue_today:      null, // BRL — receita confirmada hoje
  revenue_week:       null, // BRL — receita da semana corrente
  revenue_month:      null, // BRL — receita do mês corrente
  arr:                null, // BRL — ARR projetado (MRR × 12)
  ticket_count:       null, // number — ticket médio em BRL
  recovered_revenue:  null, // BRL — receita recuperada (boletos / cartão expirado)

  // ── Meta do mês ──────────────────────────────────────────────
  //
  // FUTURO: valor configurável por mês — Supabase tabela admin_config
  //   ou campo manual no painel de configurações do owner.
  //   ex.: { month: "2026-06", target_brl: 50000 }
  //
  monthly_goal_target: 0, // BRL — 0 = sem meta configurada

  // ── Histórico mensal (gráfico de barras) ─────────────────────
  //
  // FUTURO (Asaas ou Stripe):
  //   Últimos 6 meses de receita confirmada.
  //   Agrupado por mês no servidor.
  //   Formato: [{ label: "Jan", v: 12500.00 }, ...]
  //
  revenue_months: [
    { label: "Dez", v: 0 },
    { label: "Jan", v: 0 },
    { label: "Fev", v: 0 },
    { label: "Mar", v: 0 },
    { label: "Abr", v: 0 },
    { label: "Mai", v: 0 },
  ],

  // ── Canais de aquisição (Top Canais) ─────────────────────────
  //
  // FUTURO (Google Analytics 4):
  //   GA4 Data API → runReport
  //   Dimensão: sessionDefaultChannelGroup ou sessionSource
  //   Métrica: sessions ou conversions
  //   Agrupado em até 4 grupos: Meta Ads, TikTok, Instagram, Orgânico.
  //
  // FUTURO (alternativa sem GA4):
  //   utm_source dos pagamentos Asaas/Stripe, se capturado no checkout.
  //
  channels: [
    { name: "Meta Ads",  pct: 0, color: "#3b82f6" },
    { name: "TikTok",    pct: 0, color: "#a855f7" },
    { name: "Instagram", pct: 0, color: "#ec4899" },
    { name: "Orgânico",  pct: 0, color: "#22c55e" },
  ],

  // ── Metadados da fonte ────────────────────────────────────────
  //
  // source_status: identifica qual provider está respondendo.
  //   "unavailable" — sem integração ativa (estado atual)
  //   "asaas"       — dados vêm do Asaas
  //   "stripe"      — dados vêm do Stripe
  //   "error"       — integração configurada mas com falha
  //
  // FUTURO (Google Search Console):
  //   clicks, impressions, ctr, position — via Search Console API
  //   Adicionar campo search_console: { clicks, impressions, ctr, position }
  //
  source_status:   "unavailable",
  last_updated_at: null, // ISO 8601 — timestamp do dado mais recente
};

// ── Função principal ──────────────────────────────────────────

/**
 * Retorna as métricas financeiras do Comando Executivo.
 *
 * HOJE:
 *   Retorna EXECUTIVE_METRICS_UNAVAILABLE sem chamada de rede.
 *   O componente mostra "Aguardando dados" em todos os cards financeiros.
 *
 * FUTURO — para conectar Asaas:
 *   1. Criar api/executive-metrics.js (Vercel Function)
 *   2. A function lê process.env.ASAAS_API_KEY e chama o Asaas
 *   3. Substituir o return abaixo por:
 *
 *   try {
 *     const res = await fetch("/api/executive-metrics");
 *     if (!res.ok) return { data: EXECUTIVE_METRICS_UNAVAILABLE, error: `HTTP ${res.status}` };
 *     return { data: await res.json(), error: null };
 *   } catch (err) {
 *     return { data: EXECUTIVE_METRICS_UNAVAILABLE, error: err.message };
 *   }
 *
 * FUTURO — para conectar Stripe:
 *   Mesmo padrão acima. A Vercel Function troca Asaas por Stripe SDK.
 *   O shape de retorno (revenue_today, revenue_month, etc.) permanece idêntico.
 *   O componente não precisa saber qual provider está ativo.
 */
export async function fetchExecutiveMetrics() {
  return { data: EXECUTIVE_METRICS_UNAVAILABLE, error: null };
}
