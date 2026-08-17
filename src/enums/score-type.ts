const ScoreType = {
    DISTANCE: 0,
    POWERUP: 1,
    KILL_EAGLE: 2,
    KILL_PHOENIX: 3,
    KILL_FIRE_PROJECTILE: 4
} as const;

type ScoreType = (typeof ScoreType)[keyof typeof ScoreType];

export { ScoreType }