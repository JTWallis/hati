import { Image } from "./image";


export class ImageCollidable extends Image {

    constructor(
        scene: Phaser.Scene,
        texture: string | Phaser.Textures.Texture
    ) {
        super(scene, texture);
        scene.physics.add.existing(this);
    }

}