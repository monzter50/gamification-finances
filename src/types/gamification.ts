export interface UserLevel {
    currentLevel: number;
    currentXP: number;
    xpToNextLevel: number;
}

export interface GamificationAction {
    type: "ADD_XP" | "LEVEL_UP";
    payload: number;
}
