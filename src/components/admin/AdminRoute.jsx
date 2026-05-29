import { Navigate, Outlet } from "react-router-dom";
import { isOwnerOrAdmin } from "../../lib/access.js";

export default function AdminRoute({ profile, session, onLogout }) {
  if (!session) return <Navigate to="/" replace />;
  if (!isOwnerOrAdmin(profile)) return <Navigate to="/app" replace />;
  return <Outlet context={{ profile, onLogout }} />;
}
