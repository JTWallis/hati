import type { GameObject } from "../gameobjects/gameobject";
import type { ObjectType } from "../enums/object-type";
import type { Powerup } from "./powerup";

export interface PowerupFinishApi {
    finishPowerup:          (powerup: Powerup) => void;
}

export interface PowerupSystemApi {
    addPlayerFilter:        (filterKey: string, durationMs?: number) => Phaser.Filters.Controller;
    removePlayerFilter:     (filterKey: string) => void;
    setOverlayCount:        (count: number) => void;
    getTweens:              () => Phaser.Tweens.TweenManager;
}

export interface PowerupCollisionApi  {
    damageHostile:          (collision: GameObject, collisionType: ObjectType) => void;
}

export interface PowerupPlayerApi {
    setFlipX:               (value: boolean) => void;
    setVelocityX:           (x: number) => void;
    setRamming:             (isRamming: boolean) => void;
    dash:                   (durationMs: number, playRunAnim: boolean, postRamMs?: number) => void;
}

export interface PowerupAttackApi {
    spawnProjectileAnim:    (projectileKey: string, x: number, y: number) => void;
    createSpecialCooldown:  (cooldownMs: number) => void;
    isSpecialOnCooldown:    () => boolean;
}