import type { GameObject } from "../gameobjects/gameobject";
import type { ObjectType } from "../enums/object-type";
import type { PowerupAttackApi, PowerupCollisionApi, PowerupFinishApi, PowerupPlayerApi, PowerupSystemApi } from "./powerup-api";

export interface PowerupStartParams {
    api: PowerupSystemApi & PowerupPlayerApi & PowerupFinishApi;
}

export interface PowerupCollisionParams {
    collided: GameObject;
    collidedType: ObjectType;
    isRamming: boolean;
    api: PowerupCollisionApi & PowerupSystemApi & PowerupFinishApi;
}

export interface PowerupMoveParams {
    isMovingRight: boolean;
    isSlowWalking: boolean;
    speedWalk: number;
    speedRun: number;
    api: PowerupPlayerApi & PowerupFinishApi;
};

export interface PowerupAttackSpecialParams {
    pointerX: number;
    pointerY: number;
    pointerDown: boolean;
    isRamming: boolean;
    api: PowerupSystemApi & PowerupAttackApi & PowerupPlayerApi & PowerupFinishApi;
}