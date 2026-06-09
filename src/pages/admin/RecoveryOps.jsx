// ── Recovery Operations Center ────────────────────────────────────

import { useState, useEffect } from "react";
import { fetchPilotMetrics } from "../../lib/pilotMetrics.js";

// ── Sub-components ────────────────────────────────────────────

function MetricCard({ label, value, accent, live = false, badge = "Aguardando dados" }) {
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
        color: live ? "#22c55e" : "#2d5070",
        background: live ? "rgba(34,197,94,0.08)" : "rgba(45,80,112,0.08)",
        padding: "2px 8px", borderRadius: "20px",
      }}>
        {badge}
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

function incidentLabel(loading, count) {
  if (loading)   return "carregando...";
  if (count === 0) return "Nenhum incidente ativo";
  if (count === 1) return "1 registrado";
  return `${count} registrados`;
}

// ── Page ──────────────────────────────────────────────────────

export default function RecoveryOps() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [pilot, setPilot] = useState(null);
  const [pilotLoading, setPilotLoading] = useState(true);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    fetchPilotMetrics().then(({ data }) => {
      setPilot(data);
      setPilotLoading(false);
    });
  }, []);

  // ── Derived data ──────────────────────────────────────────────
  const connected = !!pilot && !pilotLoading;

  const incidents = pilot?.latestEvents.filter(ev => ev.humanIntervention) ?? [];

  const errorMap = pilot
    ? Object.entries(pilot.tagFrequency).map(([tag, count]) => {
        const match = pilot.latestEvents.find(ev => ev.tags?.includes(tag));
        return {
          error: tag,
          origin: "IA",
          impact: `${count} evento${count > 1 ? "s" : ""}`,
          action: match?.nextAction ?? "Revisar",
          level: count >= 2 ? "medium" : "low",
        };
      })
    : [];

  const clinicsWithIssues = pilot?.perClinic.filter(
    c => c.humanInterventions > 0 || c.criticalIncidents > 0
  ) ?? [];
  const clinicsStable = pilot?.perClinic.filter(
    c => c.humanInterventions === 0 && c.criticalIncidents === 0
  ) ?? [];
  const priorityGroups = [
    ...(clinicsWithIssues.length > 0 ? [{
      label: "Atenção imediata",
      items: clinicsWithIssues.map(c =>
        `${c.clinicId} — ${c.humanInterventions} intervenção(ões), ${c.criticalIncidents} crítico(s)`
      ),
      color: "#ef4444",
    }] : []),
    ...(clinicsStable.length > 0 ? [{
      label: "Estável",
      items: clinicsStable.map(c => c.clinicId),
      color: "#22c55e",
    }] : []),
  ];

  const cardBadge = (val) =>
    pilotLoading ? "Carregando..."
    : !pilot     ? "Indisponível"
    : val != null ? "Tempo real"
    : "Aguardando histórico";
  const cardLive = (val) => connected && val != null;

  const impactedCount = connected
    ? pilot.perClinic.filter(c => c.humanInterventions > 0 || c.criticalIncidents > 0).length
    : null;

  const METRICS = [
    {
      label: "Incidentes Abertos",
      value: connected ? String(incidents.length) : "—",
      accent: "#ef4444",
      live: connected,
      badge: pilotLoading ? "Carregando..." : !pilot ? "Indisponível" : "Tempo real",
    },
    {
      label: "Falhas Críticas",
      value: pilot?.criticalIncidents != null ? String(pilot.criticalIncidents) : "—",
      accent: "#22c55e",
      live: cardLive(pilot?.criticalIncidents),
      badge: cardBadge(pilot?.criticalIncidents),
    },
    {
      label: "Alertas Médios",
      value: pilot?.humanInterventions != null ? String(pilot.humanInterventions) : "—",
      accent: "#eab308",
      live: cardLive(pilot?.humanInterventions),
      badge: cardBadge(pilot?.humanInterventions),
    },
    {
      label: "Erros Resolvidos",
      value: "—",
      accent: "#22c55e",
      live: false,
      badge: "Aguardando backend",
    },
    {
      label: "Clínicas Impactadas",
      value: impactedCount != null ? String(impactedCount) : "—",
      accent: "#eab308",
      live: connected,
      badge: pilotLoading ? "Carregando..." : !pilot ? "Indisponível" : "Tempo real",
    },
  ];

  const openCount = incidents.length;

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
          background: openCount > 0
            ? "rgba(234,179,8,0.08)"
            : connected
            ? "rgba(34,197,94,0.08)"
            : "rgba(45,80,112,0.06)",
          border: `1px solid ${openCount > 0
            ? "rgba(234,179,8,0.2)"
            : connected
            ? "rgba(34,197,94,0.2)"
            : "rgba(45,80,112,0.2)"}`,
          borderRadius: "20px",
        }}>
          <span style={{
            width: "7px", height: "7px", borderRadius: "50%", display: "block",
            background: openCount > 0 ? "#eab308" : connected ? "#22c55e" : "#2d5070",
          }} />
          <span style={{
            fontSize: "12px", fontWeight: "600",
            color: openCount > 0 ? "#eab308" : connected ? "#22c55e" : "#2d5070",
          }}>
            {pilotLoading
              ? "Carregando..."
              : openCount > 0
              ? `${openCount} incidente${openCount > 1 ? "s" : ""} ativo${openCount > 1 ? "s" : ""}`
              : connected
              ? "Nenhum incidente ativo"
              : "Sem fonte de dados ativa"}
          </span>
        </div>
      </div>

      {/* Context banner — only when disconnected */}
      {!pilotLoading && !pilot && (
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
            Incidentes —{" "}
            <span style={{ color: "#e8f0fd" }}>
              {incidentLabel(pilotLoading, incidents.length)}
            </span>
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          {incidents.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "80px 1.2fr 2fr 1fr 1.4fr", padding: "10px 24px", borderBottom: "1px solid #0a1624", minWidth: "560px" }}>
              {["ID", "Serviço", "Impacto", "Severidade", "Status"].map(h => (
                <span key={h} style={{ fontSize: "10px", fontWeight: "700", color: "#1e3a55", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {h}
                </span>
              ))}
            </div>
          )}

          {pilotLoading ? (
            <div style={{ padding: "36px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#1e3a55", margin: 0 }}>Carregando incidentes...</p>
            </div>
          ) : incidents.length === 0 ? (
            <div style={{ padding: "36px 24px", display: "flex", flexDirection: "column", gap: "6px", alignItems: "center", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "#2d5070", margin: 0 }}>
                {connected
                  ? "Nenhuma intervenção humana registrada."
                  : "Nenhum incidente monitorado ainda."}
              </p>
              <p style={{ fontSize: "11px", color: "#1e3a55", margin: 0, fontStyle: "italic" }}>
                {connected
                  ? "Todos os eventos foram tratados pela IA."
                  : "Requer: incidents ou fonte real de monitoramento."}
              </p>
            </div>
          ) : incidents.map(({ id, clinicId, replyType, tags }, i) => (
            <div
              key={id ?? i}
              style={{
                display: "grid", gridTemplateColumns: "80px 1.2fr 2fr 1fr 1.4fr",
                alignItems: "center", padding: "14px 24px",
                borderBottom: i < incidents.length - 1 ? "1px solid #09161f" : "none",
                background: "rgba(255,255,255,0.01)",
                minWidth: "560px",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#2d5070", fontFamily: "monospace" }}>
                {id != null ? String(id).slice(0, 8) : `INC-${i + 1}`}
              </span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#c8d8eb" }}>{clinicId}</span>
              <span style={{ fontSize: "12px", color: "#6b8cac" }}>
                {replyType}
                {tags?.length > 0 && (
                  <span style={{ color: "#3d5a73" }}> · {tags.join(", ")}</span>
                )}
              </span>
              <SeverityBadge severity="medium" />
              <StatusChip status="open" />
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
            {errorMap.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "12px", minWidth: "440px" }}>
                {["Erro", "Origem", "Impacto", "Próxima ação"].map(col => (
                  <span key={col} style={{ fontSize: "9px", fontWeight: "700", color: "#1e3a55", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {col}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {pilotLoading ? (
                <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>Carregando mapa de correção...</p>
              ) : errorMap.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>
                    {connected ? "Nenhum padrão de erro identificado." : "Nenhum erro mapeado ainda."}
                  </p>
                  <p style={{ fontSize: "10px", color: "#1e3a55", margin: 0, fontStyle: "italic" }}>
                    {connected
                      ? "Sistema operando sem tags de erro."
                      : "Requer: error_map ou fonte real de diagnóstico."}
                  </p>
                </div>
              ) : errorMap.map(({ error, origin, impact, action, level }, i) => {
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
            {pilotLoading ? (
              <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>Carregando prioridades...</p>
            ) : priorityGroups.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>
                  {connected
                    ? "Aguardando atividade de clínicas."
                    : "Sem prioridades operacionais registradas."}
                </p>
                <p style={{ fontSize: "10px", color: "#1e3a55", margin: 0, fontStyle: "italic" }}>
                  {connected
                    ? "Nenhuma clínica com atividade registrada ainda."
                    : "Requer: incidentes reais ou regras de severidade."}
                </p>
              </div>
            ) : priorityGroups.map(({ label, items, color }) => (
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
