// ── Executive Command Center ─────────────────────────────────

import { useState, useEffect } from "react";
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

const brl = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n ?? 0);

const MONTHS = [
  { label: "Dez", v: 0 },
  { label: "Jan", v: 0 },
  { label: "Fev", v: 0 },
  { label: "Mar", v: 0 },
  { label: "Abr", v: 0 },
  { label: "Mai", v: 0 },
];

const CHANNELS = [
  { name: "Meta Ads",   pct: 0, color: "#3b82f6" },
  { name: "TikTok",     pct: 0, color: "#a855f7" },
  { name: "Instagram",  pct: 0, color: "#ec4899" },
  { name: "Orgânico",   pct: 0, color: "#22c55e" },
];

// ── Sub-components ────────────────────────────────────────────

function MetricCard({ label, value, trend, up, neutral = false }) {
  return (
    <div
      style={{
        background: "#0c1a2e",
        border: "1px solid #152035",
        borderRadius: "14px",
        padding: "20px 22px",
      }}
    >
      <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 10px" }}>
        {label}
      </p>
      <p style={{ fontSize: "24px", fontWeight: "700", color: "#e8f0fd", margin: "0 0 8px", letterSpacing: "-0.5px", lineHeight: 1 }}>
        {value}
      </p>
      <span
        style={{
          display: "inline-block",
          fontSize: "11px",
          fontWeight: "600",
          color: neutral
            ? "#2d5070"
            : trend === "—"
            ? "#2d5070"
            : up ? "#22c55e" : "#ef4444",
          background: neutral
            ? "rgba(45,80,112,0.08)"
            : trend === "—"
            ? "rgba(45,80,112,0.08)"
            : up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          padding: "2px 8px",
          borderRadius: "20px",
        }}
      >
        {neutral ? "Aguardando dados" : trend === "—" ? "—" : `${up ? "▲" : "▼"} ${trend}`}
      </span>
    </div>
  );
}

function RevenueChart() {
  const max = Math.max(...MONTHS.map(m => m.v));
  const H = 88;

  if (max === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: `${H + 28}px` }}>
        <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>Aguardando dados de receita</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: `${H + 28}px` }}>
      {MONTHS.map(({ label, v }, i) => {
        const isLast = i === MONTHS.length - 1;
        const barH = Math.round((v / max) * H);
        return (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "7px" }}>
            <div
              style={{
                width: "100%",
                height: `${barH}px`,
                background: isLast
                  ? "linear-gradient(to top, #1d4ed8, #60a5fa)"
                  : "linear-gradient(to top, #0e1e33, #1a3050)",
                borderRadius: "5px 5px 0 0",
                position: "relative",
              }}
            >
              {isLast && (
                <span
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#60a5fa",
                    whiteSpace: "nowrap",
                  }}
                >
                  {brl(MONTHS[MONTHS.length - 1].v)}
                </span>
              )}
            </div>
            <span style={{ fontSize: "10px", color: "#2d5070", fontWeight: "500" }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function ProgressBar({ pct, color = "#3b82f6" }) {
  return (
    <div style={{ height: "6px", background: "#0e1e33", borderRadius: "3px", overflow: "hidden" }}>
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: `linear-gradient(to right, #1d4ed8, ${color})`,
          borderRadius: "3px",
        }}
      />
    </div>
  );
}

function ActivityChart({ days, loading }) {
  const H = 64;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: `${H + 28}px` }}>
        <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>Carregando atividade...</p>
      </div>
    );
  }
  if (!days || days.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: `${H + 28}px` }}>
        <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>Aguardando atividade de IA</p>
      </div>
    );
  }

  const max = Math.max(...days.map(d => d.events), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: `${H + 28}px` }}>
      {days.map((d, i) => {
        const barH = Math.max(3, Math.round((d.events / max) * H));
        const isLast = i === days.length - 1;
        const label = d.date
          ? new Date(d.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
          : "—";
        return (
          <div key={d.date ?? i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ position: "relative", width: "100%", height: `${H}px`, display: "flex", alignItems: "flex-end" }}>
              {isLast && d.events > 0 && (
                <span style={{
                  position: "absolute", top: "-18px", left: "50%",
                  transform: "translateX(-50%)", fontSize: "10px",
                  fontWeight: "700", color: "#22c55e", whiteSpace: "nowrap",
                }}>
                  {d.events}
                </span>
              )}
              <div style={{
                width: "100%",
                height: `${barH}px`,
                background: isLast
                  ? "linear-gradient(to top, #16a34a, #22c55e)"
                  : "linear-gradient(to top, #0a2218, #0d2d20)",
                borderRadius: "4px 4px 0 0",
              }} />
            </div>
            <span style={{ fontSize: "9px", color: "#2d5070", fontWeight: "500", whiteSpace: "nowrap" }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function ExecutiveCommand() {
  const isMobile = useIsMobile();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [pilot, setPilot] = useState(null);
  const [pilotLoading, setPilotLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats().then(({ data, error }) => {
      setStats(data);
      setStatsError(error);
      setStatsLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchPilotMetrics().then(({ data }) => {
      setPilot(data);
      setPilotLoading(false);
    });
  }, []);

  const METRICS_FINANCEIROS = [
    { label: "Receita Hoje",       value: brl(0), trend: "+0%", up: true, neutral: true },
    { label: "Receita Semana",     value: brl(0), trend: "+0%", up: true, neutral: true },
    { label: "Receita Mês",        value: brl(0), trend: "+0%", up: true, neutral: true },
    { label: "ARR Projetado",      value: brl(0), trend: "+0%", up: true, neutral: true },
    { label: "Ticket Médio",       value: brl(0), trend: "+0%", up: true, neutral: true },
    { label: "Receita Recuperada", value: brl(0), trend: "+0%", up: true, neutral: true },
  ];

  const clinicasInativas = stats ? stats.clinicas_total - stats.clinicas_ativas : null;

  const METRICS_OPERACIONAIS = [
    { label: "Clínicas Ativas",   value: stats ? String(stats.clinicas_ativas)                                         : "—", trend: "—", up: true  },
    { label: "Clínicas Inativas", value: clinicasInativas != null ? String(clinicasInativas)                            : "—", trend: "—", up: false },
    { label: "Novas Vendas",      value: stats ? String(stats.novas_vendas_mes)                                        : "—", trend: "—", up: true  },
    { label: "Usuários Pagos",    value: stats ? String(stats.usuarios_pagos)                                          : "—", trend: "—", up: true  },
    { label: "Plano Anual",       value: stats ? String(stats.plano_anual)                                             : "—", trend: "—", up: true  },
    { label: "Plano Mensal",      value: stats ? String(stats.plano_mensal)                                            : "—", trend: "—", up: true  },
    { label: "Cancelamentos Mês", value: stats ? String(stats.cancelamentos_mes)                                       : "—", trend: "—", up: stats ? stats.cancelamentos_mes === 0 : true  },
    { label: "Expirando (7d)",    value: stats ? String(stats.acesso_expirando_7d)                                     : "—", trend: "—", up: stats ? stats.acesso_expirando_7d === 0 : true },
  ];

  const ALERTS = stats ? [
    ...(stats.acesso_expirando_7d > 0 ? [{ level: "warn", text: `${stats.acesso_expirando_7d} assinatura${stats.acesso_expirando_7d !== 1 ? "s" : ""} com acesso expirando nos próximos 7 dias.` }] : []),
    ...(stats.cancelamentos_mes > 0 ? [{ level: "info", text: `${stats.cancelamentos_mes} cancelamento${stats.cancelamentos_mes !== 1 ? "s" : ""} registrado${stats.cancelamentos_mes !== 1 ? "s" : ""} este mês.` }] : []),
  ] : [];

  const hasRevenueData = MONTHS.some(m => m.v > 0);
  const hasChannelData = CHANNELS.some(c => c.pct > 0);
  const monthlyGoalTarget = 0;

  const autonomyPct = pilot?.interventionPct != null
    ? Math.round(100 - pilot.interventionPct)
    : null;

  const AI_CARDS = [
    {
      label: "Eventos Processados",
      value: pilot?.totalEvents != null ? String(pilot.totalEvents) : "—",
      accent: "#22c55e",
    },
    {
      label: "Taxa de Autonomia",
      value: autonomyPct != null ? `${autonomyPct}%` : "—",
      accent: "#3b82f6",
    },
    {
      label: "Incidentes Críticos",
      value: pilot?.criticalIncidents != null ? String(pilot.criticalIncidents) : "—",
      accent: "#ef4444",
    },
    {
      label: "Saúde da IA",
      value: pilot?.health ?? "—",
      accent: "#06b6d4",
    },
  ];

  return (
    <div style={{ padding: isMobile ? "16px 14px 32px" : "20px 22px 36px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 6px" }}>
            Admin Console
          </p>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#e8f0fd", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Comando Executivo
          </h1>
          <p style={{ fontSize: "13px", color: "#3d5a73", margin: 0 }}>
            Visão financeira e de crescimento em tempo real
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "7px 14px",
            background: statsError ? "rgba(239,68,68,0.08)" : statsLoading ? "rgba(45,80,112,0.06)" : "rgba(34,197,94,0.08)",
            border: `1px solid ${statsError ? "rgba(239,68,68,0.2)" : statsLoading ? "rgba(45,80,112,0.2)" : "rgba(34,197,94,0.2)"}`,
            borderRadius: "20px",
          }}
        >
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: statsError ? "#ef4444" : statsLoading ? "#2d5070" : "#22c55e", display: "block" }} />
          <span style={{ fontSize: "12px", fontWeight: "600", color: statsError ? "#ef4444" : statsLoading ? "#2d5070" : "#22c55e" }}>
            {statsError ? "Dados indisponíveis" : statsLoading ? "Carregando..." : "Operacional"}
          </span>
        </div>
      </div>

      {/* Métricas financeiras — sem fonte ativa */}
      <p style={{ fontSize: "9px", fontWeight: "700", color: "#3d5a73", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 10px" }}>
        Financeiro — Sem fonte ativa
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        {METRICS_FINANCEIROS.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Métricas operacionais — dados em tempo real */}
      <p style={{ fontSize: "9px", fontWeight: "700", color: "#1e3a55", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 10px" }}>
        Operacional — Dados em tempo real
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        {METRICS_OPERACIONAIS.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Main layout: chart + sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 300px", gap: "20px", marginBottom: "20px" }}>

        {/* Revenue chart card */}
        <div
          style={{
            background: "#0c1a2e",
            border: "1px solid #152035",
            borderRadius: "16px",
            padding: "24px 28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 4px" }}>
                Receita Mensal
              </p>
              <p style={{ fontSize: "20px", fontWeight: "700", color: "#e8f0fd", margin: 0, letterSpacing: "-0.3px" }}>
                {brl(0)} <span style={{ fontSize: "13px", fontWeight: "400", color: "#3d5a73" }}>/ {new Date().toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}</span>
              </p>
            </div>
            <span style={{ fontSize: "12px", fontWeight: "600", color: hasRevenueData ? "#22c55e" : "#2d5070", background: hasRevenueData ? "rgba(34,197,94,0.1)" : "rgba(45,80,112,0.08)", padding: "3px 10px", borderRadius: "20px" }}>
              {hasRevenueData ? "0% MoM" : "Aguardando dados"}
            </span>
          </div>
          <RevenueChart />
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Monthly goal */}
          <div style={{ background: "#0c1a2e", border: "1px solid #152035", borderRadius: "16px", padding: "20px 22px" }}>
            <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 14px" }}>
              Meta do Mês
            </p>
            {monthlyGoalTarget === 0 ? (
              <p style={{ fontSize: "12px", color: "#2d5070", margin: 0, lineHeight: 1.5 }}>
                Sem meta configurada
              </p>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
                  <span style={{ fontSize: "22px", fontWeight: "700", color: "#e8f0fd", letterSpacing: "-0.4px" }}>0%</span>
                  <span style={{ fontSize: "11px", color: "#3d5a73" }}>{brl(monthlyGoalTarget)} alvo</span>
                </div>
                <ProgressBar pct={0} />
                <p style={{ fontSize: "11px", color: "#2d5070", margin: "8px 0 0" }}>
                  Sem dados disponíveis
                </p>
              </>
            )}
          </div>

          {/* Top channels */}
          <div style={{ background: "#0c1a2e", border: "1px solid #152035", borderRadius: "16px", padding: "20px 22px", flex: 1 }}>
            <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 16px" }}>
              Top Canais
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {hasChannelData ? CHANNELS.map(({ name, pct, color }) => (
                <div key={name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#8ba4c4" }}>{name}</span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#c8d8eb" }}>{pct}%</span>
                  </div>
                  <div style={{ height: "4px", background: "#0e1e33", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "2px" }} />
                  </div>
                </div>
              )) : (
                <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>Sem fonte de dados conectada</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Executive alerts */}
      <div style={{ background: "#0c1a2e", border: "1px solid #152035", borderRadius: "16px", padding: "22px 28px", marginBottom: "20px" }}>
        <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 16px" }}>
          Alertas Executivos
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {ALERTS.length === 0 ? (
            <p style={{ fontSize: "12px", color: statsError ? "#ef4444" : "#2d5070", margin: 0 }}>
              {statsError ? "Não foi possível carregar alertas." : statsLoading ? "Carregando..." : "Sistema operando dentro dos parâmetros esperados"}
            </p>
          ) : ALERTS.map(({ level, text }, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "10px",
                background: level === "warn" ? "rgba(234,179,8,0.06)" : "rgba(59,130,246,0.06)",
                border: `1px solid ${level === "warn" ? "rgba(234,179,8,0.12)" : "rgba(59,130,246,0.12)"}`,
              }}
            >
              <span style={{ fontSize: "14px", flexShrink: 0, lineHeight: "18px" }}>
                {level === "warn" ? "⚠" : "ℹ"}
              </span>
              <p style={{ fontSize: "13px", color: "#8ba4c4", margin: 0, lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Inteligência de IA */}
      <div style={{ background: "#0c1a2e", border: "1px solid #152035", borderRadius: "16px", padding: "22px 28px" }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>
            Inteligência de IA — Kardovik
          </p>
          <span style={{
            fontSize: "11px",
            fontWeight: "600",
            color: pilotLoading ? "#2d5070" : !pilot ? "#2d5070" : "#22c55e",
            background: pilotLoading ? "rgba(45,80,112,0.08)" : !pilot ? "rgba(45,80,112,0.08)" : "rgba(34,197,94,0.08)",
            padding: "2px 10px",
            borderRadius: "20px",
          }}>
            {pilotLoading ? "Carregando..." : !pilot ? "Sem dados" : `Sistema ${pilot.health}`}
          </span>
        </div>

        {/* AI metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "22px" }}>
          {AI_CARDS.map(({ label, value, accent }) => (
            <div
              key={label}
              style={{
                background: "#071020",
                border: "1px solid #0e1e30",
                borderRadius: "12px",
                padding: "14px 16px",
                borderTop: `2px solid ${accent}`,
              }}
            >
              <p style={{ fontSize: "9px", fontWeight: "700", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 8px" }}>
                {label}
              </p>
              <p style={{ fontSize: "20px", fontWeight: "700", color: pilotLoading ? "#1e3a55" : "#e8f0fd", margin: 0, letterSpacing: "-0.4px" }}>
                {pilotLoading ? "—" : value}
              </p>
            </div>
          ))}
        </div>

        {/* Activity chart */}
        <p style={{ fontSize: "9px", fontWeight: "700", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px" }}>
          Atividade Diária — IA Kardovik
        </p>
        <ActivityChart days={pilot?.perDay ?? []} loading={pilotLoading} />

      </div>

    </div>
  );
}
