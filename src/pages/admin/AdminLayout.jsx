import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin/executive",      label: "Executive Command Center" },
  { to: "/admin/operations",     label: "Operations Center" },
  { to: "/admin/infrastructure", label: "Infrastructure Control" },
  { to: "/admin/recovery-ops",   label: "Recovery Operations Center" },
];

export default function AdminLayout() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#f8fafc",
      }}
    >
      <aside
        style={{
          width: "244px",
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 20px 28px" }}>
          <span
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Kardovik
          </span>
          <p
            style={{
              color: "#475569",
              fontSize: "11px",
              fontWeight: "600",
              margin: "4px 0 0",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Admin
          </p>
        </div>

        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            padding: "0 12px",
          }}
        >
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "block",
                padding: "9px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "500",
                color: isActive ? "#ffffff" : "#94a3b8",
                background: isActive ? "#1e293b" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s ease",
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "32px" }}>
        <Outlet />
      </main>
    </div>
  );
}
