import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserLevel } from "@types/gamification";

interface LevelProgressProps {
    userLevel: UserLevel;
}

export function LevelProgress({ userLevel }: LevelProgressProps) {
  const progressPercentage = (userLevel.currentXP / userLevel.xpToNextLevel) * 100;

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-black">Level {userLevel.currentLevel}</h2>
        </div>
        <Badge variant="secondary">{userLevel.currentXP} / {userLevel.xpToNextLevel} XP</Badge>
      </div>
      <Progress value={progressPercentage} className="w-full" />
    </div>
  );
}
