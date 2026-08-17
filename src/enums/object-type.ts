const ObjectType = {
    STATIC: 0,
    PLAYER: 1,
    ENEMY: 2,
    PROJECTILE: 3
} as const;

type ObjectType = (typeof ObjectType)[keyof typeof ObjectType];

export { ObjectType }