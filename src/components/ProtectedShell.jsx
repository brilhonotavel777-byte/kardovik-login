import { useState, useEffect } from "react";
import Brand from "./Brand.jsx";

const ROLE_LABELS = {
  owner: "Proprietário",
  admin: "Administrador",
  dentista: "Dentista",
  atendente: "Atendente",
};

export default function ProtectedShell({ profile, session, clinic, onLogout }) {
  const [visible, setVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [useNewEngine] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const displayName = profile?.nome || session?.user?.email?.split("@")[0] || "Usuário";
  const displayEmail = session?.user?.email || profile?.email || "";
  const roleLabel = ROLE_LABELS[profile?.role] ?? profile?.role ?? "—";
  const clinicName = clinic?.nome ?? "Clínica principal";
  const clinicStatus = clinic?.status ?? "active";

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* ── HEADER ──────────────────────────────────────────── */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 32px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Brand
            size="sm"
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "5px 11px",
                borderRadius: "8px",
                background: "#f1f5f9",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>
                {displayName}
              </span>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                background: "none",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                color: loggingOut ? "#94a3b8" : "#64748b",
                cursor: loggingOut ? "not-allowed" : "pointer",
                padding: "8px 14px",
                transition: "all 0.18s ease",
              }}
              onMouseOver={(e) => {
                if (!loggingOut) {
                  e.currentTarget.style.color = "#0f172a";
                  e.currentTarget.style.background = "#f1f5f9";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = loggingOut ? "#94a3b8" : "#64748b";
                e.currentTarget.style.background = "none";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              {loggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      </header>

      {/* ── CONTEÚDO ────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "28px 32px 48px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.45s ease, transform 0.45s ease",
        }}
      >
        {useNewEngine ? (
          // ── MOTOR KARDOVIK ────────────────────────────────
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
              padding: "24px",
              minHeight: "520px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" }}>
                Kardovik
              </h1>
              <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                Insira a conversa do cliente para gerar a resposta ideal
              </p>
            </div>

            <textarea
              placeholder="Cole aqui a conversa do paciente..."
              style={{
                width: "100%",
                minHeight: "180px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "14px",
                fontSize: "14px",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />

            <button
              style={{
                alignSelf: "flex-start",
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                padding: "12px 18px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Gerar resposta
            </button>

            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontSize: "14px",
                color: "#0f172a",
              }}
            >
              A resposta gerada aparecerá aqui.
            </div>

            <div style={{ marginTop: "auto", fontSize: "12px", color: "#94a3b8", textAlign: "right" }}>
              Acesso ativo •{" "}
              {profile?.access_expires_at &&
                new Date(profile.access_expires_at).toLocaleDateString("pt-BR")}
            </div>
          </div>
        ) : (
          // ── DASHBOARD (fallback) ──────────────────────────
          <>
            {/* ── HERO ──────────────────────────────────────── */}
            <div
              style={{
                background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
                borderRadius: "18px",
                padding: "24px 32px",
                marginBottom: "24px",
                color: "#ffffff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: "-50px", right: "70px", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <p style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.55)", margin: "0 0 5px 0", letterSpacing: "0.07em", textTransform: "uppercase" }}>Painel da clínica</p>
                <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#ffffff", margin: "0 0 4px 0", letterSpacing: "-0.4px", lineHeight: 1.2 }}>{clinicName}</h1>
                <p style={{ fontSize: "14px", fontWeight: "400", color: "rgba(255,255,255,0.7)", margin: "0 0 16px 0" }}>Bem-vindo, {displayName}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 11px", borderRadius: "20px", background: "rgba(255,255,255,0.14)", fontSize: "12px", fontWeight: "600", color: "#ffffff" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                    Sessão ativa
                  </span>
                  {roleLabel !== "—" && (
                    <span style={{ padding: "4px 11px", borderRadius: "20px", background: "rgba(255,255,255,0.10)", fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.82)" }}>{roleLabel}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── CARDS ─────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              <div style={cardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)"; }}>
                <p style={cardLabelStyle}>Clínica</p>
                <p style={cardValueStyle}>{clinicName}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "10px", padding: "3px 10px", borderRadius: "20px", background: clinicStatus === "active" ? "#f0fdf4" : "#fef9c3", border: `1px solid ${clinicStatus === "active" ? "#bbf7d0" : "#fde68a"}`, fontSize: "11px", fontWeight: "600", color: clinicStatus === "active" ? "#16a34a" : "#92400e" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: clinicStatus === "active" ? "#16a34a" : "#d97706", display: "inline-block" }} />
                  {clinicStatus === "active" ? "Ativa" : clinicStatus}
                </span>
              </div>
              <div style={cardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)"; }}>
                <p style={cardLabelStyle}>Conta</p>
                <p style={cardValueStyle}>{displayName}</p>
                {displayEmail && <p style={{ ...cardSubStyle, marginBottom: "10px" }}>{displayEmail}</p>}
                {roleLabel !== "—" && <span style={badgeStyle}>{roleLabel}</span>}
              </div>
              <div style={cardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)"; }}>
                <p style={cardLabelStyle}>Acesso</p>
                <p style={cardValueStyle}>{profile?.billing_status === "paid" ? "Ativo" : "Em análise"}</p>
                {profile?.plano && <p style={cardSubStyle}>Plano {profile.plano}</p>}
                {profile?.access_expires_at && <p style={{ ...cardSubStyle, marginTop: "4px" }}>Válido até {new Date(profile.access_expires_at).toLocaleDateString("pt-BR")}</p>}
              </div>
            </div>

            <p style={{ fontSize: "12px", color: "#cbd5e1", textAlign: "center", margin: "32px 0 0 0" }}>
              Kardovik • Seus dados protegidos • Ambiente seguro
            </p>
          </>
        )}
      </main>
    </div>
  );
}

// ── Estilos reutilizáveis ────────────────────────────────────

const cardStyle = {
  background: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  padding: "18px 20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  cursor: "default",
};

const cardLabelStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#94a3b8",
  margin: "0 0 5px 0",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const cardValueStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#0f172a",
  margin: 0,
  letterSpacing: "-0.2px",
};

const cardSubStyle = {
  fontSize: "13px",
  color: "#64748b",
  margin: "3px 0 0 0",
};

const badgeStyle = {
  display: "inline-block",
  marginTop: "10px",
  padding: "3px 10px",
  borderRadius: "20px",
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  fontSize: "11px",
  fontWeight: "600",
  color: "#2563eb",
};
