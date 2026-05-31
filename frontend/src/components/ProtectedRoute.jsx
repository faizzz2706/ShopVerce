import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { PageSkeleton } from "./Skeleton";

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useSelector((s) => s.auth);
  const location = useLocation();

  if (loading) return <PageSkeleton />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
