"use client";

import { useLocalStorage } from "@aglaya/hooks/useLocalStorage";
import { useCallback } from "react";

import { gamificationLogger } from "@/lib/logger";

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
  const [ userProgress, setUserProgress ] = useLocalStorage<UserProgress>(
    "userProgress",
    INITIAL_STATE
  );

  const dispatch = useCallback((action: GamificationAction) => {
    gamificationLogger.info(`Dispatching action: ${action.type}`, {
      section: action.section,
      payload: action.payload
    });

    setUserProgress((prevState) => {
      const newState = { ...prevState };

      // Update section progress if specified
      if (action.section) {
        const sectionProgress = newState.sections[action.section];
        const oldXP = sectionProgress.xp;
        const oldLevel = sectionProgress.level;

        sectionProgress.xp += action.payload;

        // Level up section if necessary
        while (sectionProgress.xp >= XP_TO_LEVEL_UP) {
          sectionProgress.level += 1;
          sectionProgress.xp -= XP_TO_LEVEL_UP;
          gamificationLogger.info(`Section level up: ${action.section}`, {
            newLevel: sectionProgress.level,
            remainingXP: sectionProgress.xp
          });
        }

        gamificationLogger.debug(`Section progress updated: ${action.section}`, {
          oldXP,
          newXP: sectionProgress.xp,
          oldLevel,
          newLevel: sectionProgress.level
        });
      }

      // Update overall progress
      const oldOverallXP = newState.overall.currentXP;
      const oldOverallLevel = newState.overall.currentLevel;

      newState.overall.currentXP += action.payload;

      // Level up overall if necessary
      while (newState.overall.currentXP >= newState.overall.xpToNextLevel) {
        newState.overall.currentLevel += 1;
        newState.overall.currentXP -= newState.overall.xpToNextLevel;
        newState.overall.xpToNextLevel = Math.round(newState.overall.xpToNextLevel * 1.2);
        gamificationLogger.info("Overall level up!", {
          newLevel: newState.overall.currentLevel,
          xpToNextLevel: newState.overall.xpToNextLevel
        });
      }

      gamificationLogger.debug("Overall progress updated", {
        oldXP: oldOverallXP,
        newXP: newState.overall.currentXP,
        oldLevel: oldOverallLevel,
        newLevel: newState.overall.currentLevel
      });

      return newState;
    });
  }, [ setUserProgress ]);

  return {
    userProgress,
    dispatch,
  };
}
