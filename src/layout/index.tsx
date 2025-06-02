import { ReactNode } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps): ReactNode {
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
            <ThemeToggle className="mr-2" />
            <Button onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}
