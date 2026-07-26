/**
 * PrivateRoute — protects routes that require authentication.
 *
 * Usage:
 *   <Route element={<PrivateRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   // With role restriction:
 *   <Route element={<PrivateRoute allowedRoles={["ADMIN"]} />}>
 *     <Route path="/admin/users" element={<UserManagement />} />
 *   </Route>
 *
 * Behaviour:
 *   - Shows nothing while the auth session is being restored (isLoading).
 *   - Redirects to /login if the user is not authenticated.
 *   - Redirects to / (or a custom fallback) if the user's role is not in allowedRoles.
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../context/AuthContext";

interface PrivateRouteProps {
  /** If provided, only users whose role appears in this list are allowed. */
  allowedRoles?: UserRole[];
  /** Where to redirect unauthorised users. Defaults to "/" */
  unauthorizedRedirect?: string;
}

export default function PrivateRoute({
  allowedRoles,
  unauthorizedRedirect = "/",
}: PrivateRouteProps) {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  // While restoring session from localStorage, render nothing
  if (isLoading) {
    return null;
  }

  // Not logged in — go to login, preserving the intended destination
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={unauthorizedRedirect} replace />;
  }

  return <Outlet />;
}
