import { useEffect, useState } from "react";
import {  useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authLogger } from "@/config/logger";
import { useAuth } from "@/context/AuthContext";

export default function Signin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [ error, setError ] = useState<string>("");
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [ isAuthenticated, navigate ]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);
      // Navigation will happen via useEffect when isAuthenticated changes
    } catch (err) {
      authLogger.error("Login failed in UI", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al iniciar sesión. Verifica tus credenciales o la conexión con el servidor."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  type="email"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <Button className="w-full mt-4" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Iniciando sesión..." : "Log in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export const loginAction = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  // Here you would typically validate the credentials with your backend
  if (email === "user@example.com" && password === "password") {
    // Successful login
    return null;
  }

  // Failed login
  return { error: "Invalid email or password" };
};
