import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@/components/ui";
import { authLogger } from "@/config/logger";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/hooks";
import { getAuthErrorMessage } from "@/utils/errors";

interface SigninFormValues {
  email: string;
  password: string;
}

// RFC 5322-ish — good enough for client-side UX; server is the source of truth.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_VALUES: SigninFormValues = {
  email:    "",
  password: "",
};

export default function Signin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const snackbar = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode:          "onTouched", // validate on first blur, then on change
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [ isAuthenticated, navigate ]);

  const submitHandler = handleSubmit(async ({ email, password }) => {
    clearErrors("root");

    try {
      await login(email, password);
      snackbar.success({
        title:       "Welcome back!",
        description: "You have successfully logged in.",
      });
      // Navigation happens via the useEffect above when isAuthenticated flips.
    } catch (err) {
      authLogger.error("Login failed in UI", err);
      const errorMessage = getAuthErrorMessage(err);

      setError("root", { type: "server", message: errorMessage });
      snackbar.error({
        title:       "Login failed",
        description: errorMessage,
      });
    }
  });

  const rootError = errors.root?.message;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitHandler} noValidate>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  aria-invalid={errors.email ? "true" : "false"}
                  disabled={isSubmitting}
                  {...register("email", {
                    required: "Email is required",
                    pattern:  {
                      value:   EMAIL_PATTERN,
                      message: "Enter a valid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-danger" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={errors.password ? "true" : "false"}
                    disabled={isSubmitting}
                    className="pr-10"
                    {...register("password", {
                      required:  "Password is required",
                      minLength: {
                        value:   8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isSubmitting}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    aria-controls="password"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-danger" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {rootError ? (
              <p
                className="mt-3 text-sm text-danger"
                role="alert"
                aria-live="polite"
              >
                {rootError}
              </p>
            ) : null}

            <Button className="mt-4 w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in…" : "Log in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
