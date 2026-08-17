import * as Phaser from "phaser";
import type { GameObject } from "../gameobject";

export abstract class Sprite extends Phaser.Physics.Arcade.Sprite {

    private gameObject: GameObject = null;

    constructor(
        scene: Phaser.Scene,
        texture: string | Phaser.Textures.Texture,
        isImmoveable: boolean = false,
        scaleSize: number = 2
    ) {
        super(scene, 0, 0, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.enableFilters();

        if(isImmoveable) {
            this.body.immovable = true;
            (this.body as Phaser.Physics.Arcade.Body).allowGravity = false;
        }

        this.setScale(scaleSize);
    }

    public initGameObject(gameObject: GameObject) {
        this.gameObject = gameObject;
    }

    /**
     * Helper function to set the Physics body Size and Offset.
     * This function should be used in favor of separate calls to the setSize and setOffset functions,
     *   to ensure that an offset is always set after resizing the physics body.
     * This in turn keeps the physics body position correctly synchronized with its object position,
     *   when using the setPos function. 
     * @param width The width of the Body in pixels. Cannot be zero. If not given, and the parent Game Object has a frame, it will use the frame width.
     * @param height The height of the Body in pixels. Cannot be zero. If not given, and the parent Game Object has a frame, it will use the frame height.
     * @param offsetX The centered horizontal offset of the Static Body from the Game Object's x.
     * @param offsetY The centered vertical offset of the Static Body from the Game Object's y.
     */
    public setBodySizeOffset(width: number, height: number, offsetX: number = 0, offsetY: number = 0) {
        (this.body as Phaser.Physics.Arcade.Body).setSize(width, height);
        (this.body as Phaser.Physics.Arcade.Body).setOffset(offsetX, offsetY);
    }

    /**
     * Helper function to set the GameObject position, as well as the Physics Body position.
     * The Physics Body position will be centered, while factoring in its offset.
     * @param x The x position of this Game Object. Default 0.
     * @param y The y position of this Game Object. If not set it will use the x value. Default x.
     * @param z The z position of this Game Object. Default 0.
     * @param w The w position of this Game Object. Default 0.
     */
    public setPos(x?: number, y?: number, z?: number, w?: number): void {
        if(!x) x = 0;
        if(!y) y = x;

        this.setPosition(x, y, z, w);

        /*
        if(this.body.physicsType === Phaser.Physics.Arcade.STATIC_BODY) {
            this.body.position.x = (x - this.body.width / 2) + this.body.offset.x;
            this.body.position.y = (y - this.body.height / 2) + this.body.offset.y;
        }
            */
    }

    public pause() {}
    public reset() {}
    public onUse() {}
    public onReserve() {}

    public getGameObject(): GameObject {
        return this.gameObject;
    }

    addedToScene(): void {
        super.addedToScene();
    }

    removedFromScene(): void {
        super.removedFromScene();
    }
}