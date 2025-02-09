import { MoonIcon, SunIcon } from "lucide-react";
import { Link, Outlet } from "react-router";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Layout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                            Dashboard
            </Link>
            <Link
              to="/goals"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
                            Goals
            </Link>
            <Link
              to="/transactions"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
                            Transactions
            </Link>
            <Link
              to="/profile"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
                            Profile
            </Link>
            <Link
              to="/expenses"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
                  Expenses
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle Theme"
              className="mr-6"
            >
              <SunIcon className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle Theme</span>
            </Button>
            <Button onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-6 px-4">
        <Outlet />
      </main>
    </div>
  );
}
