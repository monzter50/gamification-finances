"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";

import { useGamification } from "@/hooks/useGamification";
import type { GamificationAction, UserProgress } from "@/types/gamification";

interface GamificationContextType {
    userProgress: UserProgress
    dispatch: (action: GamificationAction) => void
    currentPage: string
    setCurrentPage: (page: string) => void
    getCurrentPageProgress: () => { level: number; xp: number; percentage: number }
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProgress, dispatch } = useGamification();
  const [ currentPage, setCurrentPage ] = useState("dashboard");

  const getCurrentPageProgress = () => {
    const section = userProgress.sections[currentPage as keyof typeof userProgress.sections];
    if (!section) { return { level: 1,
      xp: 0,
      percentage: 0 }; }
    
    return {
      level: section.level,
      xp: section.xp,
      percentage: (section.xp / 100) * 100
    };
  };

  return (
    <GamificationContext.Provider 
      value={{ 
        userProgress, 
        dispatch, 
        currentPage, 
        setCurrentPage,
        getCurrentPageProgress
      }}
    >
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
