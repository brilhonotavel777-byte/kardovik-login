function getBlockReason(profile) {
  if (!profile) return "not_found";

  const status = String(profile.status || "").toLowerCase();
  const billingStatus = String(profile.billing_status || "").toLowerCase();
  const accessExpiresAt = profile.access_expires_at;

  if (status !== "active") return "inactive";
  if (billingStatus !== "paid") return "payment";
  if (!accessExpiresAt) return "no_expiration";

  const expiresAt = new Date(accessExpiresAt);
  if (Number.isNaN(expiresAt.getTime())) return "invalid_expiration";
  if (expiresAt <= new Date()) return "expired";

  return "unknown";
}

const BLOCK_COPY = {
  not_found: {
    title: "Acesso não localizado",
    message:
      "Não encontramos uma liberação ativa para este email. Verifique se você entrou com o mesmo email usado na compra.",
  },
  inactive: {
    title: "Conta temporariamente indisponível",
    message:
      "Sua conta está inativa no momento. Se isso não era esperado, revise o cadastro usado ou fale com o suporte.",
  },
  payment: {
    title: "Pagamento ainda não confirmado",
    message:
      "Seu acesso ainda não foi liberado porque o pagamento não está ativo no sistema.",
  },
  no_expiration: {
    title: "Acesso sem vigência definida",
    message: "Seu cadastro não possui uma data de acesso válida no momento.",
  },
  invalid_expiration: {
    title: "Erro na vigência do acesso",
    message: "Encontramos uma inconsistência na data de liberação do seu acesso.",
  },
  expired: {
    title: "Seu acesso expirou",
    message:
      "O período de acesso da sua conta terminou. Para continuar utilizando o Kardovik, será necessário renovar ou reativar o acesso.",
  },
  unknown: {
    title: "Acesso indisponível",
    message:
      "No momento não foi possível liberar sua entrada. Tente novamente em instantes.",
  },
};

export default function AccessBlocked({ profile, onBack }) {
  const reason = getBlockReason(profile);
  const { title, message } = BLOCK_COPY[reason];

  return (
    <div
      style={{
        opacity: 1,
        animation: "none",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px auto",
          fontSize: "24px",
        }}
      >
        🔒
      </div>

      <h1
        style={{
          fontSize: "28px",
          fontWeight: "700",
          lineHeight: 1.1,
          color: "#0f172a",
          margin: "0 0 12px 0",
          letterSpacing: "-0.5px",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          fontSize: "16px",
          lineHeight: 1.6,
          color: "#64748b",
          margin: "0 0 32px 0",
        }}
      >
        {message}
      </p>

      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          fontSize: "15px",
          fontWeight: "600",
          color: "#0f172a",
          cursor: "pointer",
          padding: "12px 24px",
          transition: "all 0.2s ease",
          width: "100%",
          marginBottom: "16px",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "#f8fafc";
          e.currentTarget.style.borderColor = "#cbd5e1";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "none";
          e.currentTarget.style.borderColor = "#e5e7eb";
        }}
      >
        ← Voltar ao login
      </button>

      <p
        style={{
          fontSize: "12px",
          color: "#94a3b8",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        Seus dados protegidos • Ambiente seguro
      </p>
    </div>
  );
}
