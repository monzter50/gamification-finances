"use client";

import { useState } from "react";

import { LevelProgress } from "@/components/level/level-progress";
import { Button } from "@/components/ui/button.tsx";
import { useGamification } from "@/hooks/useGamification.tsx";

export function GamificationModule() {
  const { userProgress, dispatch } = useGamification();
  const [ xpToAdd, setXpToAdd ] = useState(10);

  const handleAddXP = () => {
    dispatch({ type: "ADD_XP",
      payload: xpToAdd });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Finance Gamification</h1>
      <LevelProgress userLevel={userProgress.overall} />
      <div className="mt-4 flex justify-center">
        <Button onClick={handleAddXP} className="mr-2">Add {xpToAdd} XP</Button>
        <Button variant="outline" onClick={() => setXpToAdd((prev) => prev + 10)}>
                    Increase XP Reward
        </Button>
      </div>
    </div>
  );
}
