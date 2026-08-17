import { PROJECTILE_ARROW_KEY } from "../../constants/keys";
import type { ObjectType } from "../../enums/object-type";
import type { GameObject } from "../gameobject";
import { ProjectileAnimated } from "./projectile-animated";

export class ProjectileArrow extends ProjectileAnimated {

    private collisionOngoing = false;

    constructor(scene: Phaser.Scene, despawnCallback: (obj: GameObject) => void) {
        super(scene, PROJECTILE_ARROW_KEY, despawnCallback);

        this.anims.create({
            key: "default",
            frameRate: 36,
            frames: this.anims.generateFrameNumbers(this.texture.key, { start: 0, end: 5 }),
            repeat: 0,
        });

        this.on("animationcomplete-default", () => {
            this.finish();
        });


        this.setBodySize(8, 8);
    }


    public start(ownerType: ObjectType) {
        this.ownerType = ownerType;
        this.anims.startAnimation("default");
    }

    public registerCollisionForFinish(collidedType: ObjectType, collisionCallback: (obj: GameObject) => void, collided?: GameObject) {
        this.collisionOngoing = true;
        this.collidedType = collidedType;
        this.collisionCallback = collisionCallback;
        if(collided) this.collided = collided;
    }



    protected finish() {
        const doCallback: boolean = (
            this.collisionCallback  !== null &&
            this.collidedType       !== null &&
            this.ownerType          !== null &&
            this.collidedType       !== this.ownerType
        );

        if(doCallback) {
            this.collisionCallback(this.collided);
        }

        this.cleanup();
    }

    public isOngoing(): boolean {
        return this.collisionOngoing;
    }

    public getOwnerType(): ObjectType | null {
        return this.ownerType;
    }

    private cleanup(): void {
        this.despawnCallback(this.getGameObject());

        this.collisionOngoing = false;
        this.ownerType = null;
        this.collidedType = null;
        this.collisionCallback = null;
        this.collided = null;

    }
}