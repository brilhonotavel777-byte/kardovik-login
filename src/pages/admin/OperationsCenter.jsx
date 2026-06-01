// ── Operations Center ─────────────────────────────────────────

import { useState, useEffect } from "react";
import { fetchAdminOperations } from "../../lib/adminOperations.js";
import { fetchAdminStats } from "../../lib/adminStats.js";

function useIsMobile() {
  const [v, setV] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setV(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return v;
}

function relativeTime(iso) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1)  return `${Math.max(1, Math.floor(diff / 60000))}min atrás`;
  if (h < 24) return `${h}h atrás`;
  return `${d} dia${d !== 1 ? "s" : ""}`;
}

const ACTIVITY = [];

// ── Sub-components ────────────────────────────────────────────

function MetricCard({ label, value, accent }) {
  return (
    <div
      style={{
        background: "#0c1a2e",
        border: "1px solid #152035",
        borderRadius: "14px",
        padding: "18px 22px",
        borderTop: `2px solid ${accent}`,
      }}
    >
      <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 8px" }}>
        {label}
      </p>
      <p style={{ fontSize: "28px", fontWeight: "700", color: "#e8f0fd", margin: 0, letterSpacing: "-0.5px" }}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ativo:   { bg: "rgba(34,197,94,0.1)",  color: "#22c55e",  dot: "#22c55e",  label: "Ativo"       },
    novo:    { bg: "rgba(59,130,246,0.1)",  color: "#60a5fa",  dot: "#3b82f6",  label: "Novo"        },
    pausa:   { bg: "rgba(234,179,8,0.1)",   color: "#eab308",  dot: "#eab308",  label: "Pausado"     },
    risco:   { bg: "rgba(239,68,68,0.1)",   color: "#ef4444",  dot: "#ef4444",  label: "Em risco"    },
  };
  const s = map[status] ?? map.ativo;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        borderRadius: "20px",
        background: s.bg,
        fontSize: "11px",
        fontWeight: "600",
        color: s.color,
      }}
    >
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: s.dot, display: "block" }} />
      {s.label}
    </span>
  );
}

function HealthBar({ health }) {
  const color = health >= 80 ? "#22c55e" : health >= 50 ? "#eab308" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ width: "64px", height: "5px", background: "#0e1e33", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: `${health}%`, height: "100%", background: color, borderRadius: "3px" }} />
      </div>
      <span style={{ fontSize: "11px", fontWeight: "600", color, minWidth: "28px" }}>{health}%</span>
    </div>
  );
}

function ActivityDot({ type }) {
  const c = { success: "#22c55e", info: "#3b82f6", warn: "#eab308", danger: "#ef4444" };
  return (
    <span
      style={{
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: c[type] ?? c.info,
        display: "block",
        flexShrink: 0,
        marginTop: "4px",
      }}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function OperationsCenter() {
  const isMobile = useIsMobile();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => { fetchAdminOperations().then(setData); }, []);
  useEffect(() => { fetchAdminStats().then(setStats); }, []);

  const clinics = data?.clinicas ?? [];

  const METRICS = [
    { label: "Clínicas Ativas", value: data ? String(data.clinicas_ativas) : "—", accent: "#22c55e" },
    { label: "Em Onboarding",   value: data ? String(clinics.filter(c => c.display_status === "novo").length) : "—", accent: "#3b82f6" },
    { label: "Usuários Ativos", value: data ? String(clinics.reduce((s, c) => s + c.total_usuarios, 0)) : "—", accent: "#22c55e" },
    { label: "Sem Uso (7d)",    value: data ? String(clinics.filter(c => c.display_status === "risco").length) : "—", accent: "#eab308" },
    { label: "Expirando (7d)", value: stats ? String(stats.acesso_expirando_7d) : "—", accent: "#eab308" },
    { label: "Cancelamentos",  value: stats ? String(stats.cancelamentos_mes)    : "—", accent: "#ef4444" },
  ];

  return (
    <div style={{ padding: isMobile ? "16px 14px 32px" : "20px 22px 36px" }}>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "11px", fontWeight: "600", color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 6px" }}>
          Admin Console
        </p>
        <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#e8f0fd", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
          Operations Center
        </h1>
        <p style={{ fontSize: "13px", color: "#3d5a73", margin: 0 }}>
          Clínicas, usuários e saúde operacional da plataforma
        </p>
      </div>

      {/* Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {METRICS.map(m => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Table + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 280px", gap: "20px" }}>

        {/* Clinic table */}
        <div
          style={{
            background: "#0c1a2e",
            border: "1px solid #152035",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 24px",
              borderBottom: "1px solid #0e1e30",
            }}
          >
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#8ba4c4", margin: 0 }}>
              Clínicas — <span style={{ color: "#e8f0fd" }}>{data ? `${data.clinicas_ativas} ativas` : "carregando..."}</span>
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {["Todas", "Ativas", "Em risco"].map(f => (
                <span
                  key={f}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: f === "Todas" ? "#60a5fa" : "#2d5070",
                    background: f === "Todas" ? "rgba(59,130,246,0.1)" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Column headers + rows — scroll horizontal no mobile */}
          <div style={{ overflowX: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1.2fr",
              padding: "10px 24px",
              borderBottom: "1px solid #0a1624",
              minWidth: "520px",
            }}
          >
            {["Clínica", "Status", "Plano", "Último acesso", "Saúde"].map(h => (
              <span
                key={h}
                style={{ fontSize: "10px", fontWeight: "700", color: "#1e3a55", textTransform: "uppercase", letterSpacing: "0.1em" }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {!data ? (
            <div style={{ padding: "32px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#1e3a55", margin: 0, letterSpacing: "0.04em" }}>Carregando clínicas...</p>
            </div>
          ) : clinics.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
              <p style={{ fontSize: "13px", color: "#2d5070", margin: 0 }}>Nenhuma clínica cadastrada</p>
              <p style={{ fontSize: "11px", color: "#1e3a55", margin: 0 }}>Os dados aparecerão aqui após o primeiro cadastro</p>
            </div>
          ) : (
            clinics.map(({ id, nome, display_status, plano_dominante, ultimo_acesso_derivado, health_score_derivado }, i) => {
              const isPremium = plano_dominante === "anual";
              const planLabel = plano_dominante
                ? plano_dominante.charAt(0).toUpperCase() + plano_dominante.slice(1)
                : "—";
              return (
                <div
                  key={id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1.2fr",
                    alignItems: "center",
                    padding: "13px 24px",
                    borderBottom: i < clinics.length - 1 ? "1px solid #09161f" : "none",
                    minWidth: "520px",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#c8d8eb" }}>{nome ?? "—"}</span>
                  <StatusBadge status={display_status} />
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: isPremium ? "#60a5fa" : "#3d5a73",
                      background: isPremium ? "rgba(59,130,246,0.08)" : "rgba(61,90,115,0.1)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      display: "inline-block",
                    }}
                  >
                    {planLabel}
                  </span>
                  <span style={{ fontSize: "12px", color: "#3d5a73" }}>{relativeTime(ultimo_acesso_derivado)}</span>
                  <HealthBar health={health_score_derivado} />
                </div>
              );
            })
          )}
          </div>{/* end overflowX */}
        </div>

        {/* Activity feed */}
        <div
          style={{
            background: "#0c1a2e",
            border: "1px solid #152035",
            borderRadius: "16px",
            padding: "20px 20px",
          }}
        >
          <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 18px" }}>
            Atividade Recente
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {ACTIVITY.length === 0 ? (
              <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>Nenhuma atividade registrada</p>
            ) : ACTIVITY.map(({ time, event, type }, i) => (
              <div key={i} style={{ display: "flex", gap: "10px" }}>
                <ActivityDot type={type} />
                <div>
                  <p style={{ fontSize: "12px", color: "#8ba4c4", margin: "0 0 2px", lineHeight: 1.4 }}>
                    {event}
                  </p>
                  <span style={{ fontSize: "10px", color: "#1e3a55", fontWeight: "500" }}>{time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
