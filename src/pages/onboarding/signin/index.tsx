import { useEffect, useState } from "react";
import {  useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authLogger } from "@/config/logger";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/hooks";
import { getAuthErrorMessage } from "@/utils/errors";

export default function Signin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const snackbar = useSnackbar();
  const [ , setError ] = useState<string>("");
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
      snackbar.success({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      // Navigation will happen via useEffect when isAuthenticated changes
    } catch (err) {
      authLogger.error("Login failed in UI", err);
      const errorMessage = getAuthErrorMessage(err);

      setError(errorMessage);
      snackbar.error({
        title: "Login failed",
        description: errorMessage,
      });
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
