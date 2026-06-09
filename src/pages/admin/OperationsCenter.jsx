// ── Operations Center ─────────────────────────────────────────

import { useState, useEffect } from "react";
import { fetchAdminOperations } from "../../lib/adminOperations.js";
import { fetchAdminStats } from "../../lib/adminStats.js";
import { fetchPilotMetrics } from "../../lib/pilotMetrics.js";

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
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [pilot, setPilot] = useState(null);
  const [pilotLoading, setPilotLoading] = useState(true);

  useEffect(() => {
    fetchAdminOperations().then(({ data: d, error: e }) => {
      setData(d);
      setDataError(e);
      setDataLoading(false);
    });
  }, []);
  useEffect(() => {
    fetchAdminStats().then(({ data: d, error: e }) => {
      setStats(d);
      setStatsError(e);
    });
  }, []);
  useEffect(() => {
    fetchPilotMetrics().then(({ data }) => {
      setPilot(data);
      setPilotLoading(false);
    });
  }, []);

  const clinics = data?.clinicas ?? [];

  const METRICS = [
    { label: "Clínicas Ativas", value: data ? String(data.clinicas_ativas) : "—", accent: "#22c55e" },
    { label: "Em Onboarding",   value: data ? String(clinics.filter(c => c.display_status === "novo").length) : "—", accent: "#3b82f6" },
    { label: "Total Usuários", value: data ? String(clinics.reduce((s, c) => s + c.total_usuarios, 0)) : "—", accent: "#22c55e" },
    { label: "Sem Uso (7d)",    value: data ? String(clinics.filter(c => c.display_status === "risco").length) : "—", accent: "#eab308" },
    { label: "Expirando (7d)", value: stats ? String(stats.acesso_expirando_7d) : "—", accent: "#eab308" },
    { label: "Cancelamentos",  value: stats ? String(stats.cancelamentos_mes)    : "—", accent: "#ef4444" },
  ];

  return (
    <div style={{ padding: isMobile ? "16px 14px 32px" : "20px 22px 36px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 6px" }}>
            Admin Console
          </p>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#e8f0fd", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Central Operacional
          </h1>
          <p style={{ fontSize: "13px", color: "#3d5a73", margin: 0 }}>
            Clínicas, usuários e saúde operacional da plataforma
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "7px",
          padding: "7px 14px",
          background: dataError ? "rgba(239,68,68,0.08)" : dataLoading ? "rgba(45,80,112,0.06)" : "rgba(34,197,94,0.08)",
          border: `1px solid ${dataError ? "rgba(239,68,68,0.2)" : dataLoading ? "rgba(45,80,112,0.2)" : "rgba(34,197,94,0.2)"}`,
          borderRadius: "20px",
        }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: dataError ? "#ef4444" : dataLoading ? "#2d5070" : "#22c55e", display: "block" }} />
          <span style={{ fontSize: "12px", fontWeight: "600", color: dataError ? "#ef4444" : dataLoading ? "#2d5070" : "#22c55e" }}>
            {dataError ? "Erro de conexão" : dataLoading ? "Carregando..." : "Operacional"}
          </span>
        </div>
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
              Clínicas — <span style={{ color: dataError ? "#ef4444" : "#e8f0fd" }}>
                {dataLoading ? "carregando..." : dataError ? "erro de conexão" : `${data.clinicas_ativas} ativas`}
              </span>
            </p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{
                padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
                fontWeight: "600", color: "#60a5fa", background: "rgba(59,130,246,0.1)",
                cursor: "default",
              }}>
                Todas
              </span>
              {["Ativas", "Em risco"].map(f => (
                <span
                  key={f}
                  title="Filtro planejado — em breve"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
                    fontWeight: "500", color: "#2d5070", cursor: "default",
                  }}
                >
                  {f}
                  <span style={{
                    fontSize: "8px", fontWeight: "700", color: "#2d5070",
                    background: "rgba(45,80,112,0.06)", padding: "1px 5px",
                    borderRadius: "20px", letterSpacing: "0.06em",
                  }}>
                    EM BREVE
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Column headers + rows — scroll horizontal no mobile */}
          <div style={{ overflowX: "auto" }}>
          {clinics.length > 0 && (
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
                  style={{ fontSize: "10px", fontWeight: "700", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.1em" }}
                >
                  {h}
                </span>
              ))}
            </div>
          )}

          {/* Rows */}
          {dataLoading ? (
            <div style={{ padding: "32px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#2d5070", margin: 0, letterSpacing: "0.04em" }}>Carregando clínicas...</p>
            </div>
          ) : dataError ? (
            <div style={{ padding: "36px 24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
              <p style={{ fontSize: "13px", color: "#ef4444", margin: 0 }}>Erro ao carregar dados operacionais.</p>
              <p style={{ fontSize: "11px", color: "#2d5070", margin: 0 }}>Verifique a conexão e tente recarregar a página.</p>
            </div>
          ) : clinics.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
              <p style={{ fontSize: "13px", color: "#2d5070", margin: 0 }}>Nenhuma clínica cadastrada</p>
              <p style={{ fontSize: "11px", color: "#2d5070", margin: 0 }}>Os dados aparecerão aqui após o primeiro cadastro</p>
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
                      borderRadius: "20px",
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
            {pilotLoading ? (
              <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>Carregando...</p>
            ) : !pilot || pilot.latestEvents.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>Aguardando histórico operacional.</p>
                <p style={{ fontSize: "10px", color: "#2d5070", margin: 0, fontStyle: "italic" }}>Nenhum evento registrado ainda.</p>
              </div>
            ) : pilot.latestEvents.map((ev, i) => {
              const dotType = ev.humanIntervention ? "warn" : ev.tags?.length > 0 ? "info" : "success";
              return (
                <div key={ev.id ?? i} style={{ display: "flex", gap: "10px" }}>
                  <ActivityDot type={dotType} />
                  <div>
                    <p style={{ fontSize: "12px", color: "#8ba4c4", margin: "0 0 2px", lineHeight: 1.4 }}>
                      <span style={{ fontWeight: "600", color: "#c8d8eb" }}>{ev.clinicId}</span>
                      {" — "}{ev.replyType}
                      {ev.humanIntervention && (
                        <span style={{ marginLeft: "6px", fontSize: "10px", color: "#eab308" }}>• intervenção</span>
                      )}
                    </p>
                    <span style={{ fontSize: "10px", color: "#2d5070", fontWeight: "500" }}>{relativeTime(ev.ts)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Telemetria de Clínicas */}
      <div style={{ marginTop: "20px", background: "#0c1a2e", border: "1px solid #152035", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #0e1e30" }}>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "#8ba4c4", margin: 0 }}>
            Telemetria de Clínicas
            {pilot?.perClinic.length > 0 && (
              <span style={{ color: "#e8f0fd" }}> — {pilot.perClinic.length} com atividade</span>
            )}
          </p>
        </div>
        <div style={{ overflowX: "auto" }}>
          {pilotLoading ? (
            <div style={{ padding: "24px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>Carregando telemetria...</p>
            </div>
          ) : !pilot || pilot.perClinic.length === 0 ? (
            <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", gap: "6px", alignItems: "center", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "#2d5070", margin: 0 }}>Aguardando histórico operacional.</p>
              <p style={{ fontSize: "11px", color: "#2d5070", margin: 0, fontStyle: "italic" }}>Nenhuma clínica com atividade registrada ainda.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.2fr", padding: "10px 24px", borderBottom: "1px solid #0a1624", minWidth: "520px" }}>
                {["Clínica", "Eventos", "Intervenções", "Críticos", "Última atividade"].map(h => (
                  <span key={h} style={{ fontSize: "10px", fontWeight: "700", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {h}
                  </span>
                ))}
              </div>
              {pilot.perClinic.map((c, i) => (
                <div
                  key={c.clinicId}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1.2fr",
                    alignItems: "center",
                    padding: "13px 24px",
                    borderBottom: i < pilot.perClinic.length - 1 ? "1px solid #09161f" : "none",
                    minWidth: "520px",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#c8d8eb" }}>{c.clinicId}</span>
                  <span style={{ fontSize: "13px", color: "#8ba4c4" }}>{c.events}</span>
                  <span style={{
                    fontSize: "11px", fontWeight: "600",
                    color: c.humanInterventions > 0 ? "#eab308" : "#22c55e",
                    background: c.humanInterventions > 0 ? "rgba(234,179,8,0.08)" : "rgba(34,197,94,0.08)",
                    padding: "2px 8px", borderRadius: "20px", display: "inline-block",
                  }}>
                    {c.humanInterventions}
                  </span>
                  <span style={{
                    fontSize: "11px", fontWeight: "600",
                    color: c.criticalIncidents > 0 ? "#ef4444" : "#2d5070",
                    background: c.criticalIncidents > 0 ? "rgba(239,68,68,0.08)" : "transparent",
                    padding: c.criticalIncidents > 0 ? "2px 8px" : "0",
                    borderRadius: "20px", display: "inline-block",
                  }}>
                    {c.criticalIncidents}
                  </span>
                  <span style={{ fontSize: "12px", color: "#3d5a73" }}>{relativeTime(c.lastSeenAt)}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
