import { Card, CardContent, CardDescription, CardHeader, CardTitle, Label } from "@/components/ui";
import { ThemeSelector, ThemeToggle, ThemeToggleWithText } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";

// TODO(i18n)
/** Theme controls. Client-only preference — no server state. */
export const AppearanceCard = () => {
  const { theme } = useTheme();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how the app looks. Current theme:{" "}
          <span className="font-semibold capitalize">{theme}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Quick Toggle</Label>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-xs text-muted-foreground">Click the icon</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Toggle (with text)</Label>
          <ThemeToggleWithText />
        </div>
        <div className="space-y-2">
          <Label>Theme Selector</Label>
          <ThemeSelector className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
};
