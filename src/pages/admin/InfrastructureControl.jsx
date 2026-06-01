// ── Infrastructure Control ────────────────────────────────────

import { useState, useEffect } from "react";

const SERVICES = [
  { name: "Supabase",  status: "pending", uptime: "—", latency: "—" },
  { name: "Hotmart",   status: "pending", uptime: "—", latency: "—" },
  { name: "OpenAI",    status: "pending", uptime: "—", latency: "—" },
  { name: "Railway",   status: "pending", uptime: "—", latency: "—" },
  { name: "SMTP",      status: "pending", uptime: "—", latency: "—" },
  { name: "Webhooks",  status: "pending", uptime: "—", latency: "—" },
];

const METRICS = [
  { label: "Uptime Global",     value: "—",       accent: "#22c55e" },
  { label: "Latência Média",    value: "—",       accent: "#3b82f6" },
  { label: "Requisições Hoje",  value: "0",       accent: "#3b82f6" },
  { label: "Falhas nas 24h",    value: "0",       accent: "#eab308" },
  { label: "Custo IA Estimado", value: "R$ 0,00", accent: "#a855f7" },
];

const TIMELINE = [];

const INTEGRITY = [
  { label: "Database",       pct: 0, color: "#2d5070" },
  { label: "Auth Service",   pct: 0, color: "#2d5070" },
  { label: "File Storage",   pct: 0, color: "#2d5070" },
  { label: "Edge Functions", pct: 0, color: "#2d5070" },
  { label: "Realtime",       pct: 0, color: "#2d5070" },
];

// ── Sub-components ────────────────────────────────────────────

function ServiceCard({ name, status, uptime, latency }) {
  const isOk = status === "operational";
  const isPending = status === "pending";
  const dotColor = isOk ? "#22c55e" : isPending ? "#2d5070" : "#eab308";
  const dotShadow = isOk ? "rgba(34,197,94,0.5)" : isPending ? "transparent" : "rgba(234,179,8,0.5)";
  return (
    <div style={{
      background: "#0c1a2e",
      border: `1px solid ${!isOk && !isPending ? "rgba(234,179,8,0.25)" : "#152035"}`,
      borderRadius: "12px", padding: "16px 18px",
      display: "flex", flexDirection: "column", gap: "8px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: "#c8d8eb" }}>{name}</span>
        <span style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: dotColor, display: "block",
          boxShadow: `0 0 6px ${dotShadow}`,
        }} />
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <div>
          <p style={{ fontSize: "9px", color: "#1e3a55", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>Uptime</p>
          <p style={{ fontSize: "13px", fontWeight: "700", color: isOk ? "#22c55e" : "#2d5070", margin: 0 }}>{uptime}</p>
        </div>
        <div>
          <p style={{ fontSize: "9px", color: "#1e3a55", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>Latência</p>
          <p style={{ fontSize: "13px", fontWeight: "700", color: isOk ? "#6b8cac" : "#2d5070", margin: 0 }}>{latency}</p>
        </div>
      </div>
      {!isOk && !isPending && (
        <span style={{ fontSize: "10px", fontWeight: "600", color: "#eab308", background: "rgba(234,179,8,0.08)", padding: "2px 8px", borderRadius: "4px", display: "inline-block" }}>
          Desempenho degradado
        </span>
      )}
      {isPending && (
        <span style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", background: "rgba(45,80,112,0.06)", padding: "2px 8px", borderRadius: "4px", display: "inline-block" }}>
          Aguardando monitoramento
        </span>
      )}
    </div>
  );
}

function MetricCard({ label, value, accent }) {
  return (
    <div style={{
      background: "#0c1a2e", border: "1px solid #152035",
      borderRadius: "14px", padding: "18px 22px", borderTop: `2px solid ${accent}`,
    }}>
      <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 8px" }}>
        {label}
      </p>
      <p style={{ fontSize: "24px", fontWeight: "700", color: "#e8f0fd", margin: 0, letterSpacing: "-0.4px" }}>
        {value}
      </p>
    </div>
  );
}

function TimelineItem({ time, icon, text, type }) {
  const c  = { warn: "#eab308",           success: "#22c55e",           info: "#3b82f6"           };
  const bg = { warn: "rgba(234,179,8,0.1)", success: "rgba(34,197,94,0.1)", info: "rgba(59,130,246,0.1)" };
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <div style={{
        width: "26px", height: "26px", borderRadius: "8px",
        background: bg[type], display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "12px", flexShrink: 0, color: c[type],
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: "12px", color: "#8ba4c4", margin: "0 0 2px", lineHeight: 1.5 }}>{text}</p>
        <span style={{ fontSize: "10px", color: "#1e3a55", fontWeight: "600" }}>{time}</span>
      </div>
    </div>
  );
}

function IntegrityBar({ label, pct, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
        <span style={{ fontSize: "12px", color: "#6b8cac" }}>{label}</span>
        <span style={{ fontSize: "12px", fontWeight: "700", color }}>{pct}%</span>
      </div>
      <div style={{ height: "4px", background: "#0e1e33", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "2px" }} />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function InfrastructureControl() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const allOk = SERVICES.every(s => s.status === "operational");
  const allPending = SERVICES.every(s => s.status === "pending");

  return (
    <div style={{ padding: isMobile ? "16px 14px 32px" : "20px 22px 36px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 6px" }}>
            Admin Console
          </p>
          <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "700", color: "#e8f0fd", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Infrastructure Control
          </h1>
          <p style={{ fontSize: "13px", color: "#3d5a73", margin: 0 }}>
            Status de serviços, latência e integridade do sistema
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "7px",
          padding: "7px 14px",
          background: allPending ? "rgba(45,80,112,0.06)" : allOk ? "rgba(34,197,94,0.08)" : "rgba(234,179,8,0.08)",
          border: `1px solid ${allPending ? "rgba(45,80,112,0.2)" : allOk ? "rgba(34,197,94,0.2)" : "rgba(234,179,8,0.2)"}`,
          borderRadius: "20px",
        }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: allPending ? "#2d5070" : allOk ? "#22c55e" : "#eab308", display: "block" }} />
          <span style={{ fontSize: "12px", fontWeight: "600", color: allPending ? "#2d5070" : allOk ? "#22c55e" : "#eab308" }}>
            {allPending ? "Aguardando dados" : allOk ? "Todos os sistemas OK" : "1 serviço degradado"}
          </span>
        </div>
      </div>

      {/* Services */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "18px" }}>
        {SERVICES.map(s => <ServiceCard key={s.name} {...s} />)}
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "18px" }}>
        {METRICS.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Timeline + Integrity */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 300px", gap: "20px" }}>

        {/* Timeline */}
        <div style={{ background: "#0c1a2e", border: "1px solid #152035", borderRadius: "16px", padding: "22px 24px" }}>
          <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 18px" }}>
            Timeline de Eventos
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {TIMELINE.length === 0
              ? <p style={{ fontSize: "12px", color: "#2d5070", margin: 0 }}>Nenhum evento registrado</p>
              : TIMELINE.map((item, i) => <TimelineItem key={i} {...item} />)
            }
          </div>
        </div>

        {/* System integrity */}
        <div style={{ background: "#0c1a2e", border: "1px solid #152035", borderRadius: "16px", padding: "22px 24px" }}>
          <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 18px" }}>
            Integridade do Sistema
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {INTEGRITY.map(item => <IntegrityBar key={item.label} {...item} />)}
          </div>
          <div style={{ marginTop: "20px", padding: "12px 14px", background: "#071020", borderRadius: "10px", border: "1px solid #0e1e30" }}>
            <p style={{ fontSize: "11px", color: "#2d5070", margin: "0 0 4px" }}>Score geral</p>
            <p style={{ fontSize: "20px", fontWeight: "700", color: "#2d5070", margin: 0, letterSpacing: "-0.3px" }}>
              — <span style={{ fontSize: "11px", fontWeight: "400", color: "#2d5070" }}>/ 100</span>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
