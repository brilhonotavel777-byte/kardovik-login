import { Navigate, Outlet } from "react-router-dom";
import { isOwnerOrAdmin } from "../../lib/access.js";

export default function AdminRoute({ profile, session }) {
  if (!session) return <Navigate to="/" replace />;
  if (!isOwnerOrAdmin(profile)) return <Navigate to="/app" replace />;
  return <Outlet />;
}
