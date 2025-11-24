"use client";

import type React from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { useGamification } from "@/hooks/useGamification";
import { gamificationLogger } from "@/lib/logger";
import type { GamificationAction, UserProgress } from "@/types/gamification";

interface GamificationContextType {
    userProgress: UserProgress
    // eslint-disable-next-line no-unused-vars
    dispatch: (action: GamificationAction) => void
    currentPage: string
    // eslint-disable-next-line no-unused-vars
    setCurrentPage: (page: string) => void
    getCurrentPageProgress: () => { level: number; xp: number; percentage: number }
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProgress, dispatch } = useGamification();
  const [ currentPage, setCurrentPage ] = useState("dashboard");

  const getCurrentPageProgress = useCallback(() => {
    const section = userProgress.sections[currentPage as keyof typeof userProgress.sections];
    if (!section) {
      gamificationLogger.warn(`No section found for page: ${currentPage}`);
      return { level: 1,
        xp: 0,
        percentage: 0 };
    }

    gamificationLogger.debug(`Getting progress for ${currentPage}`, {
      level: section.level,
      xp: section.xp
    });

    return {
      level: section.level,
      xp: section.xp,
      percentage: (section.xp / 100) * 100
    };
  }, [ userProgress, currentPage ]);

  const value = useMemo(() => ({
    userProgress,
    dispatch,
    currentPage,
    setCurrentPage,
    getCurrentPageProgress
  }), [ userProgress, dispatch, currentPage, getCurrentPageProgress ]);

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamificationContext = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error("useGamificationContext must be used within a GamificationProvider");
  }
  return context;
};
