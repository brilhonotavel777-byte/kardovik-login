// ── Infrastructure Control ────────────────────────────────────

const SERVICES = [
  { name: "Supabase",  status: "operational", uptime: "99.9%",  latency: "68ms"  },
  { name: "Hotmart",   status: "operational", uptime: "100%",   latency: "142ms" },
  { name: "OpenAI",    status: "degraded",    uptime: "98.7%",  latency: "824ms" },
  { name: "Railway",   status: "operational", uptime: "100%",   latency: "54ms"  },
  { name: "SMTP",      status: "operational", uptime: "99.7%",  latency: "211ms" },
  { name: "Webhooks",  status: "operational", uptime: "100%",   latency: "38ms"  },
];

const METRICS = [
  { label: "Uptime Global",        value: "99,94%",  accent: "#22c55e"  },
  { label: "Latência Média",       value: "182 ms",  accent: "#3b82f6"  },
  { label: "Requisições Hoje",     value: "14.832",  accent: "#3b82f6"  },
  { label: "Falhas nas 24h",       value: "3",       accent: "#eab308"  },
  { label: "Custo IA Estimado",    value: "$ 4,28",  accent: "#a855f7"  },
];

const TIMELINE = [
  { time: "14:22", icon: "⚠", text: "OpenAI — latência elevada detectada (824ms)",       type: "warn"    },
  { time: "12:45", icon: "✓", text: "Railway — deploy automático concluído com sucesso",  type: "success" },
  { time: "11:03", icon: "ℹ", text: "SMTP — rate limit atingido momentaneamente",         type: "info"    },
  { time: "08:30", icon: "✓", text: "Backup diário do Supabase concluído",                type: "success" },
  { time: "07:15", icon: "ℹ", text: "Restart automático do worker Railway",               type: "info"    },
];

const INTEGRITY = [
  { label: "Database",      pct: 99, color: "#22c55e" },
  { label: "Auth Service",  pct: 100, color: "#22c55e" },
  { label: "File Storage",  pct: 97, color: "#22c55e"  },
  { label: "Edge Functions",pct: 99, color: "#22c55e"  },
  { label: "Realtime",      pct: 94, color: "#eab308"  },
];

// ── Sub-components ────────────────────────────────────────────

function ServiceCard({ name, status, uptime, latency }) {
  const isOk = status === "operational";
  return (
    <div
      style={{
        background: "#0c1a2e",
        border: `1px solid ${isOk ? "#152035" : "rgba(234,179,8,0.25)"}`,
        borderRadius: "12px",
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: "#c8d8eb" }}>{name}</span>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isOk ? "#22c55e" : "#eab308",
            display: "block",
            boxShadow: `0 0 6px ${isOk ? "rgba(34,197,94,0.5)" : "rgba(234,179,8,0.5)"}`,
          }}
        />
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <div>
          <p style={{ fontSize: "9px", color: "#1e3a55", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>Uptime</p>
          <p style={{ fontSize: "13px", fontWeight: "700", color: isOk ? "#22c55e" : "#eab308", margin: 0 }}>{uptime}</p>
        </div>
        <div>
          <p style={{ fontSize: "9px", color: "#1e3a55", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>Latência</p>
          <p style={{ fontSize: "13px", fontWeight: "700", color: isOk ? "#6b8cac" : "#eab308", margin: 0 }}>{latency}</p>
        </div>
      </div>
      {!isOk && (
        <span style={{ fontSize: "10px", fontWeight: "600", color: "#eab308", background: "rgba(234,179,8,0.08)", padding: "2px 8px", borderRadius: "4px", display: "inline-block" }}>
          Desempenho degradado
        </span>
      )}
    </div>
  );
}

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
      <p style={{ fontSize: "24px", fontWeight: "700", color: "#e8f0fd", margin: 0, letterSpacing: "-0.4px" }}>
        {value}
      </p>
    </div>
  );
}

function TimelineItem({ time, icon, text, type }) {
  const c = { warn: "#eab308", success: "#22c55e", info: "#3b82f6" };
  const bg = { warn: "rgba(234,179,8,0.1)", success: "rgba(34,197,94,0.1)", info: "rgba(59,130,246,0.1)" };
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <div
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "8px",
          background: bg[type],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          flexShrink: 0,
          color: c[type],
        }}
      >
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
  const allOk = SERVICES.every(s => s.status === "operational");
  return (
    <div style={{ padding: "32px 36px 48px", maxWidth: "1380px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 6px" }}>
            Admin Console
          </p>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#e8f0fd", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Infrastructure Control
          </h1>
          <p style={{ fontSize: "13px", color: "#3d5a73", margin: 0 }}>
            Status de serviços, latência e integridade do sistema
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "7px 14px",
            background: allOk ? "rgba(34,197,94,0.08)" : "rgba(234,179,8,0.08)",
            border: `1px solid ${allOk ? "rgba(34,197,94,0.2)" : "rgba(234,179,8,0.2)"}`,
            borderRadius: "20px",
          }}
        >
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: allOk ? "#22c55e" : "#eab308", display: "block" }} />
          <span style={{ fontSize: "12px", fontWeight: "600", color: allOk ? "#22c55e" : "#eab308" }}>
            {allOk ? "Todos os sistemas OK" : "1 serviço degradado"}
          </span>
        </div>
      </div>

      {/* Services */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {SERVICES.map(s => <ServiceCard key={s.name} {...s} />)}
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {METRICS.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Timeline + Integrity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>

        {/* Timeline */}
        <div style={{ background: "#0c1a2e", border: "1px solid #152035", borderRadius: "16px", padding: "22px 24px" }}>
          <p style={{ fontSize: "10px", fontWeight: "600", color: "#2d5070", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 18px" }}>
            Timeline de Eventos
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {TIMELINE.map((item, i) => <TimelineItem key={i} {...item} />)}
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
            <p style={{ fontSize: "20px", fontWeight: "700", color: "#22c55e", margin: 0, letterSpacing: "-0.3px" }}>
              97,8 <span style={{ fontSize: "11px", fontWeight: "400", color: "#2d5070" }}>/ 100</span>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
