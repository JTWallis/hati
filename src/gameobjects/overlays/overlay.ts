import * as Phaser from "phaser";

export abstract class Overlay extends Phaser.GameObjects.Container {

    protected background: Phaser.GameObjects.Image | null;

    constructor(scene: Phaser.Scene, x: number, y: number, bgTexture?: string) {
        super(scene, x, y);

        if(bgTexture) {
            this.background = scene.add.image(0, 0, bgTexture);
            this.add([this.background]);
        }

        scene.add.existing(this);

        // https://docs.phaser.io/phaser/concepts/gameobjects/dom-element
        /*
        this.setSize(32, 32);
        this.setInteractive();
        this.on("pointerdown", () => console.warn("Clicked container"));
        */

        this.setScrollFactor(0);
    }



    public setTotalVisible(visible: boolean) {
        this.setVisible(visible);
    }

}