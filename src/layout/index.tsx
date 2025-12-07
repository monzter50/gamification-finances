import {
  LayoutDashboard,
  Target,
  ListChecks,
  User,
  Wallet,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
} from "lucide-react";
import { useState } from "react";
import { ReactNode } from "react";
import { NavLink } from "react-router";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/hooks";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps): ReactNode {
  const { logout } = useAuth();
  const snackbar = useSnackbar();
  const [ collapsed, setCollapsed ] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      snackbar.success({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      snackbar.error({
        title: "Logout failed",
        description: "An error occurred while logging out.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased flex">
      {/* Sidebar */}
      <aside
        className={`relative bg-card border-r min-h-screen flex flex-col justify-between py-6 transition-all duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-56"
        } px-4`}
      >
        {/* Collapse/Expand Button */}
        <button
          className={`absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-muted border shadow flex items-center justify-center transition-transform duration-300 ${
            collapsed ? "rotate-180" : ""
          }`}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        {/* Logo Dummy */}
        <div className={`mb-8 flex items-center justify-center h-16 transition-all duration-300 ${collapsed ? "justify-center" : "justify-center"}`}>
          <div
            className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-primary transition-all duration-300 ${
              collapsed ? "scale-90" : ""
            }`}
          >
            {collapsed ? "" : "LOGO"}
          </div>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 text-sm font-medium rounded transition-all duration-300 px-3 py-2 hover:text-primary hover:bg-muted/50${
                isActive ? " text-primary bg-muted/80" : " text-muted-foreground"
              } ${collapsed ? "justify-center" : ""}`
            }
            end
          >
            <LayoutDashboard size={20} />
            <span
              className={`transition-all duration-300 origin-left ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-2"}`}
            >
              Dashboard
            </span>
          </NavLink>
          <NavLink
            to="/goals"
            className={({ isActive }) =>
              `flex items-center gap-2 text-sm font-medium rounded transition-all duration-300 px-3 py-2 hover:text-primary hover:bg-muted/50${
                isActive ? " text-primary bg-muted/80" : " text-muted-foreground"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <Target size={20} />
            <span
              className={`transition-all duration-300 origin-left ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-2"}`}
            >
              Goals
            </span>
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `flex items-center gap-2 text-sm font-medium rounded transition-all duration-300 px-3 py-2 hover:text-primary hover:bg-muted/50${
                isActive ? " text-primary bg-muted/80" : " text-muted-foreground"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <ListChecks size={20} />
            <span
              className={`transition-all duration-300 origin-left ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-2"}`}
            >
              Transactions
            </span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 text-sm font-medium rounded transition-all duration-300 px-3 py-2 hover:text-primary hover:bg-muted/50${
                isActive ? " text-primary bg-muted/80" : " text-muted-foreground"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <User size={20} />
            <span
              className={`transition-all duration-300 origin-left ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-2"}`}
            >
              Profile
            </span>
          </NavLink>
          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              `flex items-center gap-2 text-sm font-medium rounded transition-all duration-300 px-3 py-2 hover:text-primary hover:bg-muted/50${
                isActive ? " text-primary bg-muted/80" : " text-muted-foreground"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <Wallet size={20} />
            <span
              className={`transition-all duration-300 origin-left ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-2"}`}
            >
              Expenses
            </span>
          </NavLink>
          <NavLink
            to="/budget"
            className={({ isActive }) =>
              `flex items-center gap-2 text-sm font-medium rounded transition-all duration-300 px-3 py-2 hover:text-primary hover:bg-muted/50${
                isActive ? " text-primary bg-muted/80" : " text-muted-foreground"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <PiggyBank size={20} />
            <span
              className={`transition-all duration-300 origin-left ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-2"}`}
            >
              Budget
            </span>
          </NavLink>
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-end px-4">
            <div className="flex items-center space-x-4">
              <ThemeToggle className="mr-2" />
              <Button onClick={handleLogout}>Logout</Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto py-6 px-4 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
