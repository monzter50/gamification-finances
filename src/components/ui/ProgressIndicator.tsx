import { Trophy } from "lucide-react";
import { useState } from "react";

import { useGamificationContext } from "@/context/GamificationContext";

export function ProgressIndicator() {
  const { getCurrentPageProgress, currentPage } = useGamificationContext();
  const [ showTooltip, setShowTooltip ] = useState(false);
  
  const progress = getCurrentPageProgress();
  
  const getPageName = (page: string) => {
    const pageNames: Record<string, string> = {
      dashboard: "Dashboard",
      goals: "Goals", 
      transactions: "Transactions",
      profile: "Profile",
      expenses: "Expenses"
    };
    return pageNames[page] || page;
  };

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-muted/50 transition-colors"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Progress indicator"
      >
        <Trophy size={20} className="text-yellow-500" />
        {/* Progress ring */}
        <svg className="absolute inset-0 w-8 h-8 -rotate-90" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted"
          />
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 14}`}
            strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress.percentage / 100)}`}
            className="text-primary transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>
      </button>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border z-50 min-w-[200px]">
          <div className="font-semibold mb-1">{getPageName(currentPage)} Progress</div>
          <div className="flex items-center justify-between mb-2">
            <span>Level {progress.level}</span>
            <span className="text-muted-foreground">{progress.xp}/100 XP</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="text-right text-xs text-muted-foreground mt-1">
            {Math.round(progress.percentage)}% complete
          </div>
        </div>
      )}
    </div>
  );
} 