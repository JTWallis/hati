import * as Phaser from "phaser";
import type { GameObject } from "../gameobject";

export abstract class Image extends Phaser.Physics.Arcade.Image {

    private gameObject: GameObject = null;

    constructor(
        scene: Phaser.Scene,
        texture: string | Phaser.Textures.Texture
    ) {
        super(scene, 0, 0, texture);
        scene.add.existing(this);
    }

    public initGameObject(gameObject: GameObject) {
        this.gameObject = gameObject;
    }

    public pause() {}
    public reset() {}
    public onUse() {}
    public onReserve() {}

    public getGameObject(): GameObject {
        return this.gameObject;
    }

}