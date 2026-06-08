// ── Central de Engajamento ────────────────────────────────────

import { useState, useEffect } from "react";
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

function fmtTempo(min) {
  if (min == null) return null;
  if (min < 60) return `${Math.round(min)}min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

const ROADMAP = [
  {
    etapa: "Etapa 1",
    nome: "Rastreamento de login",
    campo: "usuarios.last_login_at",
    status: "implementado",
    color: "#22c55e",
  },
  {
    etapa: "Etapa 2",
    nome: "Sessões de acesso",
    campo: "session_logs",
    status: "planejado",
    color: "#2d5070",
  },
  {
    etapa: "Etapa 3",
    nome: "Eventos de atividade",
    campo: "activity_events",
    status: "planejado",
    color: "#2d5070",
  },
  {
    etapa: "Etapa 4",
    nome: "Score e ranking diário",
    campo: "clinic_daily_stats",
    status: "planejado",
    color: "#2d5070",
  },
];

// ── Sub-components ────────────────────────────────────────────

function MetricCard({ label, value, accent, live = false, badge = "Aguardando dados reais" }) {
  return (
    <div style={{
      background: "#0c1a2e",
      border: "1px solid #152035",
      borderRadius: "14px",
      padding: "20px 22px",
      borderTop: `2px solid ${accent}`,
    }}>
      <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 10px" }}>
        {label}
      </p>
      <p style={{ fontSize: "28px", fontWeight: "700", color: "#e8f0fd", margin: "0 0 8px", letterSpacing: "-0.5px", lineHeight: 1 }}>
        {value}
      </p>
      <span style={{
        display: "inline-block",
        fontSize: "11px",
        fontWeight: "600",
        color: live ? "#22c55e" : "#2d5070",
        background: live ? "rgba(34,197,94,0.08)" : "rgba(45,80,112,0.08)",
        padding: "2px 8px",
        borderRadius: "20px",
      }}>
        {badge}
      </span>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: "9px",
      fontWeight: "700",
      color: "#2d5070",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      margin: "0 0 10px",
    }}>
      {children}
    </p>
  );
}

function EmptyBlock({ title, message, accent = "#2d5070", depends }) {
  return (
    <div style={{
      background: "#0c1a2e",
      border: "1px solid #152035",
      borderRadius: "16px",
      padding: "22px 24px",
    }}>
      <p style={{
        fontSize: "10px",
        fontWeight: "700",
        color: accent,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        margin: "0 0 10px",
      }}>
        {title}
      </p>
      <p style={{ fontSize: "12px", color: "#6b8cac", margin: 0, lineHeight: 1.7 }}>
        {message}
      </p>
      {depends && (
        <p style={{
          fontSize: "10px",
          color: "#2d5070",
          margin: "10px 0 0",
          fontStyle: "italic",
        }}>
          Requer: {depends}
        </p>
      )}
    </div>
  );
}

function RoadmapRow({ etapa, nome, campo, status, color }) {
  const isAtivo = status === "implementado";
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "14px",
      padding: "12px 0",
    }}>
      <span style={{
        fontSize: "9px",
        fontWeight: "700",
        color,
        background: isAtivo ? "rgba(34,197,94,0.08)" : "rgba(45,80,112,0.06)",
        padding: "3px 8px",
        borderRadius: "4px",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        {isAtivo ? "✓ Ativo" : "Planejado"}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: "12px", fontWeight: "600", color: isAtivo ? "#c8d8eb" : "#3d5a73", margin: 0 }}>
          {nome}
        </p>
        <p style={{ fontSize: "10px", color: "#2d5070", margin: "2px 0 0", fontFamily: "monospace" }}>
          {campo}
        </p>
      </div>
      <span style={{ fontSize: "10px", color: "#2d5070", flexShrink: 0 }}>{etapa}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function EngagementCenter() {
  const isMobile = useIsMobile();
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

  useEffect(() => {
    fetchPilotMetrics().then(({ data, error }) => {
      setMetrics(data);
      setMetricsError(error);
      setMetricsLoading(false);
    });
  }, []);

  const live = !!metrics && !metricsError;
  const badge = metricsLoading ? "Carregando..." : metricsError ? "Indisponível" : live ? "Tempo real" : "Aguardando dados";

  const cards = [
    { label: "Clínicas Online Agora", accent: "#06b6d4", value: metrics?.clinicas_online != null ? String(metrics.clinicas_online) : "—", live, badge },
    { label: "Usuários Online",        accent: "#3b82f6", value: metrics?.usuarios_online != null ? String(metrics.usuarios_online) : "—", live, badge },
    { label: "Sessões Ativas",         accent: "#a855f7", value: metrics?.sessoes_ativas != null ? String(metrics.sessoes_ativas) : "—", live, badge },
    { label: "Tempo Médio de Sessão",  accent: "#eab308", value: fmtTempo(metrics?.tempo_medio_sessao) ?? "—", live, badge },
  ];

  return (
    <div style={{ padding: isMobile ? "16px 14px 32px" : "20px 22px 36px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 6px" }}>
            Admin Console
          </p>
          <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "700", color: "#e8f0fd", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Central de Engajamento
          </h1>
          <p style={{ fontSize: "13px", color: "#3d5a73", margin: 0 }}>
            Monitoramento estratégico de uso, presença e risco das clínicas no Kardovik.
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "7px",
          padding: "7px 14px",
          background: metricsError ? "rgba(239,68,68,0.06)" : metricsLoading ? "rgba(45,80,112,0.06)" : live ? "rgba(34,197,94,0.08)" : "rgba(6,182,212,0.06)",
          border: `1px solid ${metricsError ? "rgba(239,68,68,0.18)" : metricsLoading ? "rgba(45,80,112,0.2)" : live ? "rgba(34,197,94,0.2)" : "rgba(6,182,212,0.18)"}`,
          borderRadius: "20px",
        }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: metricsError ? "#ef4444" : metricsLoading ? "#2d5070" : live ? "#22c55e" : "#2d5070", display: "block" }} />
          <span style={{ fontSize: "12px", fontWeight: "600", color: metricsError ? "#ef4444" : metricsLoading ? "#2d5070" : live ? "#22c55e" : "#2d5070" }}>
            {metricsError ? "Dados indisponíveis" : metricsLoading ? "Carregando..." : live ? "Operacional" : "Telemetria não conectada"}
          </span>
        </div>
      </div>

      {/* Indicadores de Presença */}
      <SectionLabel>Indicadores de Presença — {metricsLoading ? "Carregando" : metricsError ? "Fonte indisponível" : live ? "Tempo real" : "Fonte pendente"}</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        {cards.map(c => <MetricCard key={c.label} {...c} />)}
      </div>

      {/* Monitoramento Ativo */}
      <SectionLabel>Monitoramento Ativo</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <EmptyBlock
          title="Atividade em Tempo Real"
          accent="#3b82f6"
          message="Sem dados reais conectados ainda. Monitoramento em tempo real requer telemetria de sessões ativa."
          depends="session_logs — Etapa 2"
        />
        <EmptyBlock
          title="Ranking de Uso"
          accent="#22c55e"
          message="Sem dados reais conectados ainda. Ranking será calculado quando houver histórico de sessões e atividade."
          depends="activity_events + session_logs — Etapas 2 e 3"
        />
      </div>

      {/* Análise e Risco */}
      <SectionLabel>Análise e Risco</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <EmptyBlock
          title="Clínicas em Risco"
          accent="#ef4444"
          message="Sem dados reais conectados ainda. Clínicas com queda de uso ou longo período sem acesso aparecerão aqui."
          depends="session_logs + get_admin_operations() — Etapas 1 e 2"
        />
        <EmptyBlock
          title="Score de Engajamento"
          accent="#eab308"
          message="Sem dados reais conectados ainda. Score calculado com base em frequência de acesso, sessões e atividade."
          depends="clinic_daily_stats — Etapa 4"
        />
      </div>

      {/* Inteligência Operacional */}
      <SectionLabel>Inteligência Operacional</SectionLabel>
      <div style={{ marginBottom: "24px" }}>
        <EmptyBlock
          title="Alertas Inteligentes"
          accent="#f97316"
          message="Sem dados reais conectados ainda. Alertas requerem histórico de sessões e thresholds configurados pelo operador."
          depends="session_logs + thresholds — Etapas 2 e 3"
        />
      </div>

      {/* Mapa de Evolução */}
      <div style={{ background: "#0c1a2e", border: "1px solid #152035", borderRadius: "16px", padding: "22px 24px" }}>
        <p style={{ fontSize: "10px", fontWeight: "700", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 4px" }}>
          Mapa de Evolução da Telemetria
        </p>
        <p style={{ fontSize: "11px", color: "#2d5070", margin: "0 0 16px", lineHeight: 1.5 }}>
          Dependências técnicas necessárias para ativar cada módulo desta central.
        </p>
        {ROADMAP.map((r, i) => (
          <div key={r.etapa} style={{ borderBottom: i < ROADMAP.length - 1 ? "1px solid #09161f" : "none" }}>
            <RoadmapRow {...r} />
          </div>
        ))}
      </div>

    </div>
  );
}
