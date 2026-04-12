/**
 * Regra central de acesso ao sistema.
 * Toda decisão de "pode entrar ou não" passa por aqui.
 *
 * Retorna true apenas se:
 *  - status === "active"
 *  - billing_status === "paid"
 *  - access_expires_at ainda não expirou (ou é null = sem expiração)
 */
export function canAccessSystem(profile) {
  if (!profile) return false;

  const { status, billing_status, access_expires_at } = profile;

  if (status !== "active") return false;
  if (billing_status !== "paid") return false;
  if (!access_expires_at) return false;
  if (new Date(access_expires_at) < new Date()) return false;

  return true;
}

/**
 * Mapeamento de eventos do Hotmart para campos da tabela `usuarios`.
 *
 * Uso futuro no webhook:
 *   const update = HOTMART_STATUS_MAP[event.hottok] ?? null;
 *   if (update) await supabase.from("usuarios").update(update).eq("hotmart_subscriber_code", code);
 */
export const HOTMART_STATUS_MAP = {
  // Compra aprovada / primeira ativação
  APPROVED: {
    billing_status: "paid",
    status: "active",
  },

  // Renovação de plano recorrente
  COMPLETE: {
    billing_status: "paid",
    status: "active",
  },

  // Cancelamento voluntário
  CANCELED: {
    billing_status: "canceled",
    status: "inactive",
  },

  // Reembolso solicitado e aprovado
  REFUNDED: {
    billing_status: "refunded",
    status: "inactive",
  },

  // Chargeback (fraude ou contestação bancária)
  CHARGEBACK: {
    billing_status: "refunded",
    status: "blocked",
  },

  // Inadimplência / cobrança recorrente falhou
  OVERDUE: {
    billing_status: "overdue",
    status: "inactive",
  },
};

/**
 * Mensagens amigáveis por billing_status.
 * Usadas na tela de bloqueio para comunicação contextual futura.
 */
export const ACCESS_BLOCK_REASON = {
  canceled: "Sua assinatura foi cancelada.",
  refunded: "Identificamos um reembolso associado à sua conta.",
  overdue: "Sua assinatura está com pagamento em aberto.",
  pending: "Seu pagamento ainda está sendo processado.",
  blocked: "Sua conta foi temporariamente suspensa.",
};
