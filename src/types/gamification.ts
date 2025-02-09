export interface UserLevel {
    currentLevel: number
    currentXP: number
    xpToNextLevel: number
}

export interface GamificationAction {
    type: "ADD_XP" | "LEVEL_UP"
    payload: number
    section?: "dashboard" | "goals" | "transactions" | "profile" | "expenses"
}

export interface SectionProgress {
    level: number
    xp: number
}

export interface UserProgress {
    overall: UserLevel
    sections: {
        dashboard: SectionProgress
        goals: SectionProgress
        transactions: SectionProgress
        profile: SectionProgress
        expenses: SectionProgress
    }
}
