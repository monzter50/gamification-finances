import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  PiggyBank,
  User,
  Wallet,
} from "lucide-react";
import { Suspense, useState } from "react";
import { NavLink, Outlet } from "react-router";

import { useAuth } from "@/app/providers/AuthProvider";
import { PageFallback } from "@/app/routes/PageFallback";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useSnackbar } from "@/shared/hooks";
import { ThemeToggle } from "@/shared/theme";

// TODO(i18n)
const NAV_ITEMS: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transactions", icon: ListChecks },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/budget", label: "Budget", icon: PiggyBank },
  { to: "/accounts", label: "Accounts", icon: Wallet },
];

/** Sidebar + header around the signed-in pages. Pages render in the <Outlet>. */
export const AppLayout = () => {
  const { logout } = useAuth();
  const snackbar = useSnackbar();
  const [collapsed, setCollapsed] = useState(false);

  // logout() never rejects: the local session is always cleared.
  const handleLogout = async () => {
    await logout();
    snackbar.success({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="flex min-h-screen bg-background font-sans antialiased">
      <aside
        className={cn(
          "relative flex min-h-screen flex-col justify-between border-r bg-card px-4 py-6 transition-all duration-300 ease-in-out",
          collapsed ? "w-sidebar-collapsed" : "w-sidebar",
        )}
      >
        <button
          className={cn(
            "absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-muted shadow transition-transform duration-300",
            collapsed && "rotate-180",
          )}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className="mb-8 flex h-16 items-center justify-center">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full bg-muted text-2xl font-bold text-primary transition-all duration-300",
              collapsed && "scale-90",
            )}
          >
            {collapsed ? "" : "LOGO"}
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2" aria-label="Main">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-muted/50 hover:text-primary",
                  isActive ? "bg-muted/80 text-primary" : "text-muted-foreground",
                  collapsed && "justify-center",
                )
              }
            >
              <Icon size={20} aria-hidden />
              <span
                className={cn(
                  "origin-left transition-all duration-300",
                  collapsed ? "w-0 overflow-hidden opacity-0" : "ml-2 w-auto opacity-100",
                )}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-end px-4">
            <div className="flex items-center space-x-4">
              <ThemeToggle className="mr-2" />
              <Button onClick={handleLogout}>Logout</Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto flex-1 px-4 py-6">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};
