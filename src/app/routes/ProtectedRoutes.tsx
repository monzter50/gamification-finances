import { Navigate } from "react-router";

import { AppLayout } from "@/app/layout/AppLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import { Skeleton } from "@/components/ui";

/**
 * Renders the app layout for signed-in users and sends everyone else to
 * /login. While a stored token is being verified it shows a placeholder, so
 * nobody is bounced to /login on reload.
 */
export const ProtectedRoutes = () => {
  const { isAuthenticated, isCheckingSession } = useAuth();

  if (isCheckingSession) {
    return (
      <div
        className="flex min-h-screen bg-background"
        aria-busy="true"
        aria-label="Checking your session"
      >
        <Skeleton className="w-sidebar rounded-none" />
        <div className="flex-1 space-y-stack p-container-pad">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <AppLayout />;
};
