import { Image } from "./image";



export class ImageBackground extends Image {

    constructor(scene: Phaser.Scene, texture: string) {
        super(scene, texture);
    }

    public override reset(): void {
        this.clearAlpha();
        this.setDepth(0);
    }

    public override onReserve(): void {
        this.setDepth(0);
    }
}