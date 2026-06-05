// ── Recovery Operations Center ────────────────────────────────

import { useState, useEffect } from "react";

const METRICS = [
  { label: "Incidentes Abertos",  value: "—", accent: "#ef4444" },
  { label: "Falhas Críticas",     value: "—", accent: "#22c55e" },
  { label: "Alertas Médios",      value: "—", accent: "#eab308" },
  { label: "Erros Resolvidos",    value: "—", accent: "#22c55e" },
  { label: "Clínicas Impactadas", value: "—", accent: "#eab308" },
];

const INCIDENTS = [];

const ERROR_MAP = [];

const PRIORITY = [];

// ── Sub-components ────────────────────────────────────────────

function MetricCard({ label, value, accent }) {
  return (
    <div style={{
      background: "#0c1a2e", border: "1px solid #152035",
      borderRadius: "14px", padding: "18px 22px", borderTop: `2px solid ${accent}`,
    }}>
      <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 8px" }}>
        {label}
      </p>
      <p style={{ fontSize: "28px", fontWeight: "700", color: "#e8f0fd", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
        {value}
      </p>
      <span style={{
        display: "inline-block", fontSize: "11px", fontWeight: "600",
        color: "#2d5070", background: "rgba(45,80,112,0.08)",
        padding: "2px 8px", borderRadius: "20px",
      }}>
        Aguardando dados
      </span>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const map = {
    high:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "CRÍTICO" },
    medium: { color: "#eab308", bg: "rgba(234,179,8,0.1)",   label: "MÉDIO"   },
    low:    { color: "#6b8cac", bg: "rgba(107,140,172,0.1)", label: "BAIXO"   },
  };
  const s = map[severity] ?? map.low;
  return (
    <span style={{ fontSize: "10px", fontWeight: "700", color: s.color, background: s.bg, padding: "3px 8px", borderRadius: "5px", letterSpacing: "0.06em" }}>
      {s.label}
    </span>
  );
}

function StatusChip({ status }) {
  const map = {
    open:          { color: "#ef4444", bg: "rgba(239,68,68,0.08)",  label: "Aberto"       },
    investigating: { color: "#eab308", bg: "rgba(234,179,8,0.08)",  label: "Investigando" },
    resolved:      { color: "#22c55e", bg: "rgba(34,197,94,0.08)",  label: "Resolvido"    },
  };
  const s = map[status] ?? map.open;
  return (
    <span style={{ fontSize: "11px", fontWeight: "600", color: s.color, background: s.bg, padding: "3px 10px", borderRadius: "20px" }}>
      {s.label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function RecoveryOps() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const openCount = INCIDENTS.filter(i => i.status !== "resolved").length;

  return (
    <div style={{ padding: isMobile ? "16px 14px 32px" : "20px 22px 36px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 6px" }}>
            Admin Console
          </p>
          <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "700", color: "#e8f0fd", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Central de Recuperação
          </h1>
          <p style={{ fontSize: "13px", color: "#3d5a73", margin: 0 }}>
            Incidentes, falhas e ações corretivas da plataforma
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "7px", padding: "7px 14px",
          background: openCount > 0 ? "rgba(234,179,8,0.08)" : INCIDENTS.length > 0 ? "rgba(34,197,94,0.08)" : "rgba(45,80,112,0.06)",
          border: `1px solid ${openCount > 0 ? "rgba(234,179,8,0.2)" : INCIDENTS.length > 0 ? "rgba(34,197,94,0.2)" : "rgba(45,80,112,0.2)"}`,
          borderRadius: "20px",
        }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: openCount > 0 ? "#eab308" : INCIDENTS.length > 0 ? "#22c55e" : "#2d5070", display: "block" }} />
          <span style={{ fontSize: "12px", fontWeight: "600", color: openCount > 0 ? "#eab308" : INCIDENTS.length > 0 ? "#22c55e" : "#2d5070" }}>
            {openCount > 0 ? `${openCount} incidente${openCount > 1 ? "s" : ""} ativo${openCount > 1 ? "s" : ""}` : INCIDENTS.length > 0 ? "Nenhum incidente ativo" : "Sem fonte de dados ativa"}
          </span>
        </div>
      </div>

      {/* Context banner — sem fonte de dados ativa */}
      {INCIDENTS.length === 0 && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "12px",
          padding: "14px 18px", marginBottom: "20px",
          background: "rgba(45,80,112,0.06)",
          border: "1px solid rgba(45,80,112,0.14)",
          borderRadius: "12px",
        }}>
          <span style={{ fontSize: "14px", flexShrink: 0, lineHeight: "20px", color: "#2d5070" }}>ℹ</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <p style={{ fontSize: "12px", fontWeight: "600", color: "#3d5a73", margin: 0 }}>
              Sem fonte de dados de incidentes conectada.
            </p>
            <p style={{ fontSize: "11px", color: "#2d5070", margin: 0, lineHeight: 1.5 }}>
              Os dados desta central serão exibidos quando uma fonte real de monitoramento for integrada.
            </p>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {METRICS.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Incident list */}
      <div style={{ background: "#0c1a2e", border: "1px solid #152035", borderRadius: "16px", overflow: "hidden", marginBottom: "20px" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #0e1e30" }}>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "#8ba4c4", margin: 0 }}>
            Incidentes — <span style={{ color: "#e8f0fd" }}>{INCIDENTS.length} registrados</span>
          </p>
        </div>

        {/* Incident table — scroll on mobile */}
        <div style={{ overflowX: "auto" }}>
          {INCIDENTS.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "80px 1.2fr 2fr 1fr 1.4fr", padding: "10px 24px", borderBottom: "1px solid #0a1624", minWidth: "560px" }}>
              {["ID", "Serviço", "Impacto", "Severidade", "Status"].map(h => (
                <span key={h} style={{ fontSize: "10px", fontWeight: "700", color: "#1e3a55", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {h}
                </span>
              ))}
            </div>
          )}

          {INCIDENTS.length === 0 ? (
            <div style={{ padding: "36px 24px", display: "flex", flexDirection: "column", gap: "6px", alignItems: "center", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "#2d5070", margin: 0 }}>Nenhum incidente monitorado ainda.</p>
              <p style={{ fontSize: "11px", color: "#1e3a55", margin: 0, fontStyle: "italic" }}>Requer: incidents ou fonte real de monitoramento.</p>
            </div>
          ) : INCIDENTS.map(({ id, service, impact, severity, status }, i) => (
            <div
              key={id}
              style={{
                display: "grid", gridTemplateColumns: "80px 1.2fr 2fr 1fr 1.4fr",
                alignItems: "center", padding: "14px 24px",
                borderBottom: i < INCIDENTS.length - 1 ? "1px solid #09161f" : "none",
                background: status === "resolved" ? "transparent" : "rgba(255,255,255,0.01)",
                minWidth: "560px",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#2d5070", fontFamily: "monospace" }}>{id}</span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#c8d8eb" }}>{service}</span>
              <span style={{ fontSize: "12px", color: "#6b8cac" }}>{impact}</span>
              <SeverityBadge severity={severity} />
              <StatusChip status={status} />
            </div>
          ))}
        </div>
      </div>

      {/* Error map + priority panel */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 280px", gap: "20px" }}>

        {/* Error map */}
        <div style={{ background: "#0c1a2e", border: "1px solid #152035", borderRadius: "16px", padding: "22px 24px" }}>
          <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 18px" }}>
            Mapa de Correção — Erro → Origem → Impacto → Ação
          </p>

          <div style={{ overflowX: "auto" }}>
            {ERROR_MAP.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "12px", minWidth: "440px" }}>
                {["Erro", "Origem", "Impacto", "Próxima ação"].map(col => (
                  <span key={col} style={{ fontSize: "9px", fontWeight: "700", color: "#1e3a55", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {col}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {ERROR_MAP.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>Nenhum erro mapeado ainda.</p>
                  <p style={{ fontSize: "10px", color: "#1e3a55", margin: 0, fontStyle: "italic" }}>Requer: error_map ou fonte real de diagnóstico.</p>
                </div>
              ) : ERROR_MAP.map(({ error, origin, impact, action, level }, i) => {
                const borderColor = level === "medium" ? "rgba(234,179,8,0.2)" : "rgba(107,140,172,0.15)";
                const bg = level === "medium" ? "rgba(234,179,8,0.04)" : "rgba(107,140,172,0.04)";
                return (
                  <div
                    key={i}
                    style={{
                      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "10px", padding: "12px 14px", borderRadius: "10px",
                      background: bg, border: `1px solid ${borderColor}`,
                      alignItems: "center", minWidth: "440px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#c8d8eb", fontWeight: "500" }}>{error}</span>
                    <span style={{ fontSize: "12px", color: "#6b8cac" }}>{origin}</span>
                    <span style={{ fontSize: "12px", color: "#6b8cac" }}>{impact}</span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#3b82f6", background: "rgba(59,130,246,0.08)", padding: "3px 10px", borderRadius: "6px", display: "inline-block" }}>
                      {action}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Priority panel */}
        <div style={{ background: "#0c1a2e", border: "1px solid #152035", borderRadius: "16px", padding: "22px 20px" }}>
          <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 16px" }}>
            Painel de Prioridade
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {PRIORITY.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>Sem prioridades operacionais registradas.</p>
                <p style={{ fontSize: "10px", color: "#1e3a55", margin: 0, fontStyle: "italic" }}>Requer: incidentes reais ou regras de severidade.</p>
              </div>
            ) : PRIORITY.map(({ label, items, color }) => (
              <div key={label}>
                <p style={{ fontSize: "10px", fontWeight: "700", color, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 7px" }}>
                  {label}
                </p>
                {items.map((item, j) => (
                  <div
                    key={j}
                    style={{
                      padding: "8px 12px", borderRadius: "8px",
                      background: "#071020", border: "1px solid #0e1e30",
                      borderLeft: `3px solid ${color}`,
                      marginBottom: j < items.length - 1 ? "6px" : 0,
                    }}
                  >
                    <p style={{ fontSize: "12px", color: "#8ba4c4", margin: 0, lineHeight: 1.4 }}>{item}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
