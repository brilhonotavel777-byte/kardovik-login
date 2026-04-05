export default function AccessBlocked({ onBack }) {
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
          fontWeight: "750",
          lineHeight: 1.1,
          color: "#0f172a",
          margin: "0 0 12px 0",
          letterSpacing: "-0.5px",
        }}
      >
        Acesso indisponível
      </h1>

      <p
        style={{
          fontSize: "16px",
          lineHeight: 1.6,
          color: "#64748b",
          margin: "0 0 32px 0",
        }}
      >
        Seu acesso está indisponível no momento.
        <br />
        Verifique sua assinatura ou fale com o suporte.
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
