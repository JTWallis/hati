import * as Phaser from "phaser";
import { PROJECTILE_FIRE_KEY } from "../../constants/keys";
import { ImageCollidable } from "../images/image-collidable";
import { ObjectType } from "../../enums/object-type";

const PROJECTILE_SPEED = 140;

export class ProjectileFire extends ImageCollidable {

    private ownerType: ObjectType | null;

    constructor(scene: Phaser.Scene) {
        super(scene, PROJECTILE_FIRE_KEY);

        this.reset();
    }

    public addDifficulty() {
        this.setScale(3);
    }

    public override reset() {
        this.setScale(2);
        this.ownerType = null;
    }

    public override onReserve(): void {
        this.ownerType = null;
    }

    public fireAt(spawnX: number, spawnY: number, targetX: number, targetY: number, ownerType = ObjectType.ENEMY) {
        this.ownerType = ownerType;
        this.setPosition(spawnX, spawnY);
        const angle = Phaser.Math.Angle.Between(spawnX, spawnY, targetX, targetY);

        this.setRotation(angle + Math.PI);
        this.scene.physics.velocityFromRotation(angle, PROJECTILE_SPEED, this.body.velocity);
    }

    public reflect(switchOwnerType: boolean) {
        if(switchOwnerType && this.ownerType) {
            this.ownerType = (this.ownerType === ObjectType.ENEMY) ? ObjectType.PLAYER : ObjectType.ENEMY;
        }

        console.log("New ownertype " + this.ownerType);

        this.setRotation(this.rotation + Math.PI);
        this.setVelocity(-this.body.velocity);
    }

    public getOwnerType(): ObjectType | null {
        return this.ownerType;
    }

}