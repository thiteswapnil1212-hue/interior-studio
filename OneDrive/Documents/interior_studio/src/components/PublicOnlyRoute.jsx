import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicOnlyRoute() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <div className="route-loader">Checking your session...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
