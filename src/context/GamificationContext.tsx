"use client";

import type React from "react";
import { createContext, useContext } from "react";

import { useGamification } from "@/hooks/useGamification";
import type { GamificationAction, UserProgress } from "@/types/gamification";

interface GamificationContextType {
    userProgress: UserProgress
    dispatch: (action: GamificationAction) => void
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProgress, dispatch } = useGamification();

  return <GamificationContext.Provider value={{ userProgress,
    dispatch }}>{children}</GamificationContext.Provider>;
};

export const useGamificationContext = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error("useGamificationContext must be used within a GamificationProvider");
  }
  return context;
};
