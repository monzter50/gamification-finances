import { Home, RotateCw } from "lucide-react";
import { useEffect } from "react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import { Button } from "@/components/ui";
import { AppError } from "@/shared/errors/AppError";
import { ErrorPanel } from "@/shared/errors/components/ErrorPanel";
import { reportError } from "@/shared/errors/report";

// TODO(i18n)
const COPY = {
  notFound: "Page not found",
  crashed: "This page ran into a problem",
  reload: "Reload page",
  home: "Go to dashboard",
} as const;

/**
 * React Router `errorElement`. Catches anything thrown while rendering a
 * route (or its loader) so the user gets a recoverable screen instead of a
 * blank page. Nested under the app layout, the sidebar stays usable.
 */
const RouteErrorPage = () => {
  const routeError = useRouteError();

  const error = isRouteErrorResponse(routeError)
    ? new AppError({
        message: `${routeError.status} ${routeError.statusText}`,
        status: routeError.status,
        cause: routeError,
      })
    : routeError;

  useEffect(() => {
    reportError(error, { source: "RouteErrorPage" });
  }, [error]);

  const isNotFound = isRouteErrorResponse(routeError) && routeError.status === 404;
  const handleReload = () => window.location.reload();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-stack py-12">
      <ErrorPanel error={error} title={isNotFound ? COPY.notFound : COPY.crashed} />
      <div className="flex justify-center gap-inline">
        <Button variant="outline" onClick={handleReload}>
          <RotateCw aria-hidden="true" />
          {COPY.reload}
        </Button>
        <Button asChild>
          <Link to="/">
            <Home aria-hidden="true" />
            {COPY.home}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default RouteErrorPage;
