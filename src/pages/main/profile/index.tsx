import { PageHeader } from "@/components/ui";
import { AppearanceCard, ProfileOverview, ProfileSettings } from "@/features/profile";

const ProfilePage = () => (
  <div className="space-y-stack">
    <PageHeader
      title="Your Profile"
      description="Level up, track your streak, and manage your savings goal."
    />
    <ProfileOverview />
    <ProfileSettings />
    <AppearanceCard />
  </div>
);

export default ProfilePage;
