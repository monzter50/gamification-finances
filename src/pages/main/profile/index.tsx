import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress.tsx";
import { useGamificationContext } from "@/context/GamificationContext.tsx";

interface UserProfile {
    name: string
    email: string
    avatar: string
}

export default function Profile() {
  const [ profile, setProfile ] = useState<UserProfile>({
    name: "John Doe",
    email: "john@example.com",
    avatar: "/placeholder.svg",
  });

  const { userProgress, dispatch } = useGamificationContext();

  useEffect(() => {
    // Award XP for visiting the profile page
    dispatch({ type: "ADD_XP",
      payload: 5,
      section: "profile" });
  }, [ dispatch ]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log("Profile updated:", profile);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">User Profile</h2>
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>Update your profile information here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Avatar</Button>
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile,
                    name: e.target.value })}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile,
                    email: e.target.value })}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdateProfile}>Save Changes</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Profile Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={(userProgress.sections.profile.xp / 100) * 100} className="mt-2" />
          <p className="text-sm mt-2">
            Level {userProgress.sections.profile.level} - XP: {userProgress.sections.profile.xp}/100
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
