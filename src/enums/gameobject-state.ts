const GameObjectState = {
    ACTIVE: 0,
    DYING: 1,
    DESPAWNED: 2
} as const;

type GameObjectState = (typeof GameObjectState)[keyof typeof GameObjectState];

export { GameObjectState }