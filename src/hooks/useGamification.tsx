"use client";

import { useState, useCallback, useEffect } from "react";

import type { UserProgress, GamificationAction, SectionProgress } from "../types/gamification";

const INITIAL_SECTION_PROGRESS: SectionProgress = {
  level: 1,
  xp: 0,
};

const INITIAL_STATE: UserProgress = {
  overall: {
    currentLevel: 1,
    currentXP: 0,
    xpToNextLevel: 100,
  },
  sections: {
    dashboard: { ...INITIAL_SECTION_PROGRESS },
    goals: { ...INITIAL_SECTION_PROGRESS },
    transactions: { ...INITIAL_SECTION_PROGRESS },
    profile: { ...INITIAL_SECTION_PROGRESS },
    expenses: { ...INITIAL_SECTION_PROGRESS }
  },
};

const XP_TO_LEVEL_UP = 100;

export function useGamification() {
  const [ userProgress, setUserProgress ] = useState<UserProgress>(() => {
    const savedProgress = localStorage.getItem("userProgress");
    return savedProgress ? JSON.parse(savedProgress) : INITIAL_STATE;
  });

  useEffect(() => {
    localStorage.setItem("userProgress", JSON.stringify(userProgress));
  }, [ userProgress ]);

  const dispatch = useCallback((action: GamificationAction) => {
    setUserProgress((prevState) => {
      const newState = { ...prevState };

      // Update section progress if specified
      if (action.section) {
        console.log("action", action);
        console.log("section", newState.sections[action.section]);
        const sectionProgress = newState.sections[action.section];
        sectionProgress.xp += action.payload;

        // Level up section if necessary
        while (sectionProgress.xp >= XP_TO_LEVEL_UP) {
          sectionProgress.level += 1;
          sectionProgress.xp -= XP_TO_LEVEL_UP;
        }
      }

      // Update overall progress
      newState.overall.currentXP += action.payload;

      // Level up overall if necessary
      while (newState.overall.currentXP >= newState.overall.xpToNextLevel) {
        newState.overall.currentLevel += 1;
        newState.overall.currentXP -= newState.overall.xpToNextLevel;
        newState.overall.xpToNextLevel = Math.round(newState.overall.xpToNextLevel * 1.2);
      }

      return newState;
    });
  }, []);

  return {
    userProgress,
    dispatch,
  };
}
