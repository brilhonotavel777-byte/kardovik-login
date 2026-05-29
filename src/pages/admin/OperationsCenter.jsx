// ── Operations Center ─────────────────────────────────────────

const METRICS = [
  { label: "Clínicas Ativas",    value: "184", accent: "#22c55e" },
  { label: "Em Onboarding",      value: "12",  accent: "#3b82f6" },
  { label: "Usuários Ativos",    value: "847", accent: "#22c55e" },
  { label: "Sem Uso (7d)",       value: "8",   accent: "#eab308" },
  { label: "Suporte Aberto",     value: "3",   accent: "#eab308" },
  { label: "Cancelamentos",      value: "2",   accent: "#ef4444" },
];

const CLINICS = [
  { name: "Sorriso & Saúde",  status: "ativo",    plan: "Pro",   last: "2h atrás",  health: 96 },
  { name: "Dental Premium",   status: "ativo",    plan: "Pro",   last: "5h atrás",  health: 88 },
  { name: "OralMax Clínica",  status: "pausa",    plan: "Basic", last: "5 dias",    health: 42 },
  { name: "SmileX Odonto",    status: "novo",     plan: "Pro",   last: "1h atrás",  health: 100 },
  { name: "Dental Excellence",status: "ativo",    plan: "Pro",   last: "3h atrás",  health: 91 },
  { name: "OralPro Center",   status: "risco",    plan: "Basic", last: "9 dias",    health: 18 },
];

const ACTIVITY = [
  { time: "14:32", event: "SmileX Odonto realizou primeiro acesso", type: "success" },
  { time: "13:47", event: "Sorriso & Saúde — resposta gerada",      type: "info"    },
  { time: "12:10", event: "OralPro Center sem acesso há 9 dias",    type: "warn"    },
  { time: "11:38", event: "Dental Premium — upgrade para Pro",      type: "success" },
  { time: "10:55", event: "Novo cadastro: SmileX Odonto",           type: "info"    },
  { time: "09:20", event: "Cancelamento solicitado: Clin. Brite",   type: "danger"  },
];

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
  return (
    <div style={{ padding: "32px 36px 48px", maxWidth: "1380px" }}>

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
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        {METRICS.map(m => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Table + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px" }}>

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
              Clínicas — <span style={{ color: "#e8f0fd" }}>184 ativas</span>
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

          {/* Column headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1.2fr",
              padding: "10px 24px",
              borderBottom: "1px solid #0a1624",
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
          {CLINICS.map(({ name, status, plan, last, health }, i) => (
            <div
              key={name}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1.2fr",
                alignItems: "center",
                padding: "13px 24px",
                borderBottom: i < CLINICS.length - 1 ? "1px solid #09161f" : "none",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#c8d8eb" }}>{name}</span>
              <StatusBadge status={status} />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: plan === "Pro" ? "#60a5fa" : "#3d5a73",
                  background: plan === "Pro" ? "rgba(59,130,246,0.08)" : "rgba(61,90,115,0.1)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  display: "inline-block",
                }}
              >
                {plan}
              </span>
              <span style={{ fontSize: "12px", color: "#3d5a73" }}>{last}</span>
              <HealthBar health={health} />
            </div>
          ))}
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
            {ACTIVITY.map(({ time, event, type }, i) => (
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
