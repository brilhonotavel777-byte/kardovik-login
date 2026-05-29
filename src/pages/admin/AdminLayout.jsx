import { useState, useEffect } from "react";
import { NavLink, Outlet, useOutletContext } from "react-router-dom";

const NAV = [
  { to: "/admin/executive",      label: "Executive Command", dot: "#3b82f6" },
  { to: "/admin/operations",     label: "Operations Center", dot: "#22c55e" },
  { to: "/admin/infrastructure", label: "Infrastructure",    dot: "#a855f7" },
  { to: "/admin/recovery-ops",   label: "Recovery Ops",     dot: "#ef4444" },
];

const FONT = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function AdminLayout() {
  const { profile, onLogout } = useOutletContext() ?? {};
  const displayName = profile?.nome || profile?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const h = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Remove #root width/centering constraints while admin is active; restore on unmount
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    const prev = {
      width: root.style.width,
      maxWidth: root.style.maxWidth,
      margin: root.style.margin,
      textAlign: root.style.textAlign,
      borderInline: root.style.borderInline,
    };
    Object.assign(root.style, {
      width: "100%",
      maxWidth: "none",
      margin: "0",
      textAlign: "left",
      borderInline: "none",
    });
    return () => Object.assign(root.style, prev);
  }, []);

  const sidebarInner = (
    <>
      {/* Brand */}
      <div style={{ padding: "26px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "34px", height: "34px",
            background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
            borderRadius: "9px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "15px", fontWeight: "800",
            color: "#fff", letterSpacing: "-0.5px", flexShrink: 0,
            boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
          }}>K</div>
          <div>
            <p style={{ color: "#e8f0fd", fontSize: "14px", fontWeight: "700", margin: 0, letterSpacing: "-0.3px" }}>Kardovik</p>
            <p style={{ color: "#1d4ed8", fontSize: "9px", fontWeight: "700", margin: 0, textTransform: "uppercase", letterSpacing: "0.14em" }}>Admin Console</p>
          </div>
        </div>
      </div>

      <div style={{ height: "1px", background: "#0e1e30", margin: "0 20px 14px" }} />
      <p style={{ fontSize: "9px", fontWeight: "700", color: "#1e3a55", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 20px 8px" }}>Módulos</p>

      <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: "1px" }}>
        {NAV.map(({ to, label, dot }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
              fontWeight: isActive ? "600" : "400",
              color: isActive ? "#c8dcf8" : "#3d5a73",
              background: isActive
                ? "linear-gradient(90deg, rgba(37,99,235,0.14) 0%, rgba(37,99,235,0.04) 100%)"
                : "transparent",
              textDecoration: "none", transition: "all 0.15s ease",
              borderLeft: isActive ? "2px solid #3b82f6" : "2px solid transparent",
              marginLeft: "2px",
            })}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: dot, flexShrink: 0, opacity: 0.7 }} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: "12px 10px 18px", borderTop: "1px solid #0e1e30" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 12px", borderRadius: "10px",
          background: "#071020", border: "1px solid #0e1e30", marginBottom: "8px",
        }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "linear-gradient(135deg, #1d4ed8, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: "700", color: "#fff", flexShrink: 0,
          }}>{initial}</div>
          <div style={{ overflow: "hidden", minWidth: 0 }}>
            <p style={{ color: "#8ba4c4", fontSize: "12px", fontWeight: "600", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</p>
            <p style={{ color: "#3b82f6", fontSize: "9px", fontWeight: "700", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>Proprietário</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: "100%", padding: "8px 12px", background: "none",
            border: "1px solid #0e1e30", borderRadius: "8px",
            color: "#1e3a55", fontSize: "12px", fontWeight: "500",
            cursor: "pointer", textAlign: "center", letterSpacing: "0.02em",
          }}
        >Sair da sessão</button>
      </div>
    </>
  );

  // ── Mobile layout ─────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh", fontFamily: FONT, background: "#07111e" }}>

        {/* Top bar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 40,
          height: "52px", background: "#030b15",
          borderBottom: "1px solid #0e1e30",
          display: "flex", alignItems: "center",
          padding: "0 16px", gap: "12px",
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            style={{
              background: "none", border: "1px solid #152035",
              borderRadius: "8px", padding: "5px 9px",
              color: "#6b8cac", cursor: "pointer", fontSize: "18px",
              lineHeight: 1, display: "flex", alignItems: "center",
            }}
          >☰</button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "26px", height: "26px",
              background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
              borderRadius: "7px", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "#fff",
            }}>K</div>
            <span style={{ color: "#e8f0fd", fontSize: "13px", fontWeight: "700", letterSpacing: "-0.3px" }}>Kardovik</span>
            <span style={{ color: "#1d4ed8", fontSize: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em" }}>Admin</span>
          </div>
        </div>

        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(3,11,21,0.75)", backdropFilter: "blur(3px)" }}
            onClick={() => setSidebarOpen(false)}
          >
            <aside
              style={{
                width: "244px", height: "100vh",
                background: "#030b15", borderRight: "1px solid #0e1e30",
                display: "flex", flexDirection: "column",
              }}
              onClick={e => e.stopPropagation()}
            >
              {sidebarInner}
            </aside>
          </div>
        )}

        <main style={{ minWidth: 0, background: "#07111e" }}>
          <Outlet />
        </main>
      </div>
    );
  }

  // ── Desktop layout ────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: FONT, background: "#07111e" }}>
      <aside style={{
        width: "244px", background: "#030b15",
        borderRight: "1px solid #0e1e30",
        display: "flex", flexDirection: "column",
        flexShrink: 0, position: "sticky", top: 0, height: "100vh",
      }}>
        {sidebarInner}
      </aside>
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto", background: "#07111e" }}>
        <Outlet />
      </main>
    </div>
  );
}
