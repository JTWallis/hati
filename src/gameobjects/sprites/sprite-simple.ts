import { Sprite } from "./sprite";


export class SpriteSimple extends Sprite {

    constructor(
        scene: Phaser.Scene,
        texture: string | Phaser.Textures.Texture,
        frameCount: number,
        isImmoveable: boolean = false,
        scaleSize: number = 2,
        frameRate: number = 10
    ) {
        super(scene, texture, isImmoveable, scaleSize);
        this.createDefaultAnimation(frameCount, frameRate);
        this.anims.play("default", true);
    }


    protected createDefaultAnimation(frameCount: number, frameRate: number): void {
        this.anims.create({
            key: "default",
            frameRate: frameRate,
            frames: this.anims.generateFrameNumbers(this.texture.key, { start: 0, end: frameCount - 1 }),
            repeat: -1
        });
    }

}