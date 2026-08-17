import type { ObjectType } from "../../enums/object-type";
import type { GameObject } from "../gameobject";
import { Sprite } from "../sprites/sprite";

export abstract class ProjectileAnimated extends Sprite {


    protected despawnCallback: (obj: GameObject) => void;
    protected ownerType: ObjectType | null = null;
    protected collidedType: ObjectType | null = null;
    protected collisionCallback: (collided?: GameObject) => void = null;
    protected collided: GameObject | null = null;

    constructor(scene: Phaser.Scene, textureKey: string, despawnCallback: (obj: GameObject) => void) {
        super(scene, textureKey);
        this.despawnCallback = despawnCallback;
    }

    public abstract start(ownerType: ObjectType): void;
    public abstract registerCollisionForFinish(collidedType: ObjectType, collisionCallback: (collided: GameObject) => void, collided?: GameObject): void;
    public abstract isOngoing(): boolean;
    public abstract getOwnerType(): ObjectType | null;
    protected abstract finish(): void;
    
    //public abstract collideSucceeded(collidedType: EntityType): boolean;
    //public abstract isFinished(): boolean;
}