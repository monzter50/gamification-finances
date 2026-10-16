import { Skeleton } from "@/components/ui";
import { useProfile } from "@/features/profile/api/profileQueries";
import { ProfileForm } from "@/features/profile/components/ProfileForm";

/** The edit form, mounted once the profile is loaded (errors show in ProfileOverview). */
export const ProfileSettings = () => {
  const { data: profile, isPending, isError } = useProfile();
  if (isPending) return <Skeleton className="h-80 w-full" />;
  if (isError) return null;
  // A saved profile has a new `updatedAt` → fresh form defaults, no reset effect.
  return <ProfileForm key={profile.updatedAt} profile={profile} />;
};
