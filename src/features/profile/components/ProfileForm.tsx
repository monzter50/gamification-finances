import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  FieldError,
  Input,
  Label,
} from "@/components/ui";
import { useUpdateProfile } from "@/features/profile/api/useUpdateProfile";
import { toProfileChanges } from "@/features/profile/model/profile-form";
import type { UserProfileData } from "@/types/api";

const CURRENCY = "MXN";

interface ProfileFormValues {
  name: string;
  savingsGoal: string;
}

const toValues = (profile: UserProfileData): ProfileFormValues => ({
  name: profile.name ?? "",
  savingsGoal: String(profile.savingsGoal ?? 0),
});

export interface ProfileFormProps {
  /** Loaded profile. Remount (key on `updatedAt`) to pick up a new one. */
  profile: UserProfileData;
}

// TODO(i18n)
export const ProfileForm = ({ profile }: ProfileFormProps) => {
  const update = useUpdateProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<ProfileFormValues>({ defaultValues: toValues(profile) });

  const onSubmit = handleSubmit((values) => {
    const changes = toProfileChanges(profile, values);
    if (changes) update.mutate(changes);
  });

  const busy = update.isPending;
  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : "?";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
        <CardDescription>
          Update your display name and savings goal. Email is managed by your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit} noValidate>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">{initial}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">{profile.name || "—"}</span>
              <span className="text-sm text-muted-foreground">{profile.email || "—"}</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                disabled={busy}
                placeholder="Your name"
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                })}
              />
              <FieldError id="name-error" message={errors.name?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="savingsGoal">Savings Goal ({CURRENCY})</Label>
              <Input
                id="savingsGoal"
                type="number"
                min={0}
                step={100}
                disabled={busy}
                placeholder="10000"
                aria-invalid={errors.savingsGoal ? "true" : "false"}
                aria-describedby={errors.savingsGoal ? "savingsGoal-error" : undefined}
                {...register("savingsGoal", {
                  validate: (v) => {
                    const n = Number(v);
                    if (v.trim() === "" || Number.isNaN(n)) return "Must be a number";
                    if (n < 0) return "Must be ≥ 0";
                    return true;
                  },
                })}
              />
              <FieldError id="savingsGoal-error" message={errors.savingsGoal?.message} />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile.email} disabled readOnly />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={!isDirty || busy}>
            {busy && <Loader2 aria-hidden="true" className="animate-spin" />}
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty || busy}
            onClick={() => reset(toValues(profile))}
          >
            Reset
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
