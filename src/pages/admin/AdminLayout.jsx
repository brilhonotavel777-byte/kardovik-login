import { NavLink, Outlet, useOutletContext } from "react-router-dom";

const NAV = [
  {
    to: "/admin/executive",
    label: "Executive Command",
    dot: "#3b82f6",
  },
  {
    to: "/admin/operations",
    label: "Operations Center",
    dot: "#22c55e",
  },
  {
    to: "/admin/infrastructure",
    label: "Infrastructure",
    dot: "#a855f7",
  },
  {
    to: "/admin/recovery-ops",
    label: "Recovery Ops",
    dot: "#ef4444",
  },
];

export default function AdminLayout() {
  const { profile, onLogout } = useOutletContext() ?? {};
  const displayName =
    profile?.nome || profile?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#07111e",
      }}
    >
      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside
        style={{
          width: "244px",
          background: "#030b15",
          borderRight: "1px solid #0e1e30",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Brand */}
        <div style={{ padding: "26px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
                borderRadius: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: "800",
                color: "#fff",
                letterSpacing: "-0.5px",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
              }}
            >
              K
            </div>
            <div>
              <p
                style={{
                  color: "#e8f0fd",
                  fontSize: "14px",
                  fontWeight: "700",
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                Kardovik
              </p>
              <p
                style={{
                  color: "#1d4ed8",
                  fontSize: "9px",
                  fontWeight: "700",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                }}
              >
                Admin Console
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "#0e1e30", margin: "0 20px 14px" }} />

        {/* Nav label */}
        <p
          style={{
            fontSize: "9px",
            fontWeight: "700",
            color: "#1e3a55",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            margin: "0 20px 8px",
          }}
        >
          Módulos
        </p>

        {/* Navigation */}
        <nav
          style={{
            flex: 1,
            padding: "0 10px",
            display: "flex",
            flexDirection: "column",
            gap: "1px",
          }}
        >
          {NAV.map(({ to, label, dot }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: isActive ? "600" : "400",
                color: isActive ? "#c8dcf8" : "#3d5a73",
                background: isActive
                  ? "linear-gradient(90deg, rgba(37,99,235,0.14) 0%, rgba(37,99,235,0.04) 100%)"
                  : "transparent",
                textDecoration: "none",
                transition: "all 0.15s ease",
                borderLeft: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                marginLeft: "2px",
              })}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: dot,
                  flexShrink: 0,
                  opacity: 0.7,
                }}
              />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user + logout */}
        <div
          style={{
            padding: "12px 10px 18px",
            borderTop: "1px solid #0e1e30",
          }}
        >
          {/* User card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              background: "#071020",
              border: "1px solid #0e1e30",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #1d4ed8, #4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "700",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
            <div style={{ overflow: "hidden", minWidth: 0 }}>
              <p
                style={{
                  color: "#8ba4c4",
                  fontSize: "12px",
                  fontWeight: "600",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {displayName}
              </p>
              <p
                style={{
                  color: "#3b82f6",
                  fontSize: "9px",
                  fontWeight: "700",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Proprietário
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "none",
              border: "1px solid #0e1e30",
              borderRadius: "8px",
              color: "#1e3a55",
              fontSize: "12px",
              fontWeight: "500",
              cursor: "pointer",
              textAlign: "center",
              letterSpacing: "0.02em",
            }}
          >
            Sair da sessão
          </button>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflowY: "auto",
          background: "#07111e",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
