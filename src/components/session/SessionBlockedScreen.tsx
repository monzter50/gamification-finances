import { MonitorX } from "lucide-react";

import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui";
import type { SessionBlockReason } from "@/config/session";

interface SessionBlockedScreenProps {
  reason: SessionBlockReason
  onDismiss: () => void
}

const COPY: Record<SessionBlockReason, { title: string, description: string, action: string }> = {
  revoked: {
    title:       "Tu sesión finalizó",
    description: "Tu cuenta se utilizó para iniciar sesión en otro dispositivo. Por seguridad, esta sesión se cerró.",
    action:      "Volver a iniciar sesión",
  },
  already_active: {
    title:       "Ya tienes una sesión activa",
    description: "Tu cuenta ya tiene una sesión activa en otro dispositivo. Cierra esa sesión, o espera unos minutos, e inténtalo de nuevo.",
    action:      "Entendido",
  },
};

/**
 * Full-screen blocking overlay shown when the single-active-session rule is
 * triggered — either mid-session (token revoked) or at login (session already
 * active). Renders above everything (fixed inset-0) so stale screens behind it
 * can't be interacted with.
 */
export const SessionBlockedScreen = ({ reason, onDismiss }: SessionBlockedScreenProps) => {
  const copy = COPY[reason];

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-blocked-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm"
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle text-danger">
            <MonitorX className="h-6 w-6" />
          </div>
          <CardTitle id="session-blocked-title">{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter>
          <Button className="w-full" onClick={onDismiss} autoFocus>
            {copy.action}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
