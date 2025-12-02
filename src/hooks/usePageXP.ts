import { useEffect, useRef } from "react";

import { useGamificationContext } from "@/context/GamificationContext";

type PageSection = "dashboard" | "goals" | "transactions" | "profile" | "expenses";

/**
 * Hook to award XP when a user visits a page for the first time in a session
 * @param section - The section/page name for tracking
 * @param xpAmount - Amount of XP to award (default: 5)
 */
export const usePageXP = (section: PageSection, xpAmount = 5): void => {
  const { dispatch } = useGamificationContext();
  const hasAwardedXP = useRef(false);

  useEffect(() => {
    // Award XP for visiting the page only once
    if (!hasAwardedXP.current) {
      dispatch({
        type: "ADD_XP",
        payload: xpAmount,
        section
      });
      hasAwardedXP.current = true;
    }
  }, [ dispatch, section, xpAmount ]);
};
