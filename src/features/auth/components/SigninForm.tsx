import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
import { isSessionAlreadyActive } from "@/config/session";
import { loginErrorMessage } from "@/features/auth/model/login-errors";
import { useSnackbar } from "@/shared/hooks";

interface SigninFormValues {
  email: string;
  password: string;
}

// RFC 5322-ish — good enough for client-side UX; server is the source of truth.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_VALUES: SigninFormValues = { email: "", password: "" };

export interface SigninFormProps {
  /** Signs in; rejects with the request's error. Provided by the AuthProvider. */
  // eslint-disable-next-line no-unused-vars
  onLogin: (email: string, password: string) => Promise<void>;
}

// TODO(i18n)
export const SigninForm = ({ onLogin }: SigninFormProps) => {
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
    mode: "onTouched", // validate on first blur, then on change
  });

  const submitHandler = handleSubmit(async ({ email, password }) => {
    clearErrors("root");
    try {
      await onLogin(email, password);
      snackbar.success({ title: "Welcome back!", description: "You have successfully logged in." });
    } catch (err) {
      // Single active session: the blocking screen explains this case already.
      if (isSessionAlreadyActive(err)) return;

      authLogger.error("Login failed", err);
      const message = loginErrorMessage(err);
      setError("root", { type: "server", message });
      snackbar.error({ title: "Login failed", description: message });
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
                    pattern: {
                      value: EMAIL_PATTERN,
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
                      required: "Password is required",
                      minLength: {
                        value: 8,
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
              <p className="mt-3 text-sm text-danger" role="alert" aria-live="polite">
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
};
