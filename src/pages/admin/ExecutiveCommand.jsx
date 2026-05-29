// ── Executive Command Center ─────────────────────────────────

import { useState, useEffect } from "react";
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

const MONTHS = [
  { label: "Dez", v: 68400  },
  { label: "Jan", v: 75200  },
  { label: "Fev", v: 82100  },
  { label: "Mar", v: 70800  },
  { label: "Abr", v: 88600  },
  { label: "Mai", v: 94320  },
];

const CHANNELS = [
  { name: "Meta Ads",   pct: 38, color: "#3b82f6"  },
  { name: "TikTok",     pct: 24, color: "#a855f7"  },
  { name: "Instagram",  pct: 22, color: "#ec4899"  },
  { name: "Orgânico",   pct: 16, color: "#22c55e"  },
];

const ALERTS = [
  { level: "warn",  text: "Ticket médio caiu 3% — abaixo da meta semanal." },
  { level: "info",  text: "4 clínicas sem acesso nos últimos 7 dias." },
  { level: "warn",  text: "Meta do mês a 78,6% — 8 dias restantes." },
];

// ── Sub-components ────────────────────────────────────────────

function MetricCard({ label, value, trend, up }) {
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
          color: up ? "#22c55e" : "#ef4444",
          background: up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          padding: "2px 8px",
          borderRadius: "20px",
        }}
      >
        {up ? "▲" : "▼"} {trend}
      </span>
    </div>
  );
}

function RevenueChart() {
  const max = Math.max(...MONTHS.map(m => m.v));
  const H = 88;
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
                  94,3k
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

// ── Page ──────────────────────────────────────────────────────

export default function ExecutiveCommand() {
  const isMobile = useIsMobile();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAdminStats().then(setStats);
  }, []);

  const METRICS = [
    { label: "Receita Hoje",       value: "R$ 4.280",  trend: "+12%", up: true  },
    { label: "Receita Semana",     value: "R$ 28.640", trend: "+8%",  up: true  },
    { label: "Receita Mês",        value: "R$ 94.320", trend: "+18%", up: true  },
    { label: "ARR Projetado",      value: "R$ 1,13M",  trend: "+22%", up: true  },
    { label: "Clínicas Ativas",    value: stats ? String(stats.clinicas_ativas) : "—", trend: "+6", up: true },
    { label: "Novas Vendas",       value: stats ? String(stats.novas_vendas_mes) : "—", trend: "+4", up: true },
    { label: "Ticket Médio",       value: "R$ 512",    trend: "-3%",  up: false },
    { label: "Receita Recuperada", value: "R$ 8.400",  trend: "+34%", up: true  },
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
            Executive Command Center
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
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "20px",
          }}
        >
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", display: "block" }} />
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#22c55e" }}>Operacional</span>
        </div>
      </div>

      {/* Metrics grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        {METRICS.map(m => (
          <MetricCard key={m.label} {...m} />
        ))}
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
                R$ 94.320 <span style={{ fontSize: "13px", fontWeight: "400", color: "#3d5a73" }}>/ mai 2026</span>
              </p>
            </div>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "3px 10px", borderRadius: "20px" }}>
              ▲ +18% MoM
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
              <span style={{ fontSize: "22px", fontWeight: "700", color: "#e8f0fd", letterSpacing: "-0.4px" }}>78,6%</span>
              <span style={{ fontSize: "11px", color: "#3d5a73" }}>R$ 120k alvo</span>
            </div>
            <ProgressBar pct={78.6} />
            <p style={{ fontSize: "11px", color: "#2d5070", margin: "8px 0 0" }}>
              Faltam R$ 25.680 • 8 dias
            </p>
          </div>

          {/* Top channels */}
          <div style={{ background: "#0c1a2e", border: "1px solid #152035", borderRadius: "16px", padding: "20px 22px", flex: 1 }}>
            <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 16px" }}>
              Top Canais
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {CHANNELS.map(({ name, pct, color }) => (
                <div key={name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#8ba4c4" }}>{name}</span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#c8d8eb" }}>{pct}%</span>
                  </div>
                  <div style={{ height: "4px", background: "#0e1e33", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "2px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Executive alerts */}
      <div style={{ background: "#0c1a2e", border: "1px solid #152035", borderRadius: "16px", padding: "22px 28px" }}>
        <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 16px" }}>
          Alertas Executivos
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {ALERTS.map(({ level, text }, i) => (
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

    </div>
  );
}
