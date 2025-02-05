import { useState, useCallback } from "react";

import { UserLevel, GamificationAction } from "../types/gamification";

const INITIAL_STATE: UserLevel = {
  currentLevel: 1,
  currentXP: 0,
  xpToNextLevel: 100,
};

export function useGamification() {
  const [ userLevel, setUserLevel ] = useState<UserLevel>(INITIAL_STATE);

  const dispatch = useCallback((action: GamificationAction) => {
    setUserLevel((prevState) => {
      switch (action.type) {
      case "ADD_XP":
        const newXP = prevState.currentXP + action.payload;
        if (newXP >= prevState.xpToNextLevel) {
          return {
            currentLevel: prevState.currentLevel + 1,
            currentXP: newXP - prevState.xpToNextLevel,
            xpToNextLevel: Math.round(prevState.xpToNextLevel * 1.5),
          };
        }
        return { ...prevState,
          currentXP: newXP };
      case "LEVEL_UP":
        return {
          ...prevState,
          currentLevel: prevState.currentLevel + 1,
          xpToNextLevel: Math.round(prevState.xpToNextLevel * 1.5),
        };
      default:
        return prevState;
      }
    });
  }, []);

  return {
    userLevel,
    dispatch
  };
}
