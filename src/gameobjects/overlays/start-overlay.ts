import { OVERLAY_LAYOUT_KEY, OVERLAY_START_KEY } from "../../constants/keys";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants/world";
import { Overlay } from "./overlay";

export class StartOverlay extends Overlay {

    private iconPressMove: Phaser.GameObjects.Image;
    private iconLayout: Phaser.GameObjects.Image;
    private tween: Phaser.Tweens.Tween;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);

        this.iconPressMove = scene.add.image(0, 0, OVERLAY_START_KEY);
        this.iconLayout = scene.add.image(0, 0, OVERLAY_LAYOUT_KEY);

        const wHalf = SCREEN_WIDTH / 2;
        const hHalf = SCREEN_HEIGHT / 2;

        const yDefaultPressMove = hHalf + this.iconPressMove.height;
        const yDefaultLayout = hHalf;

        this.iconPressMove.setPosition(wHalf, yDefaultPressMove);
        this.iconLayout.setPosition(wHalf, yDefaultLayout);

        this.add([this.iconPressMove, this.iconLayout]);

        // https://docs.phaser.io/phaser/concepts/gameobjects/dom-element

        /*
        this.setSize(32, 32);
        this.setInteractive();
        this.on("pointerdown", () => console.warn("Clicked container"));
        */

        const moveAnimateMax = 4;

        this.tween = scene.tweens.addCounter({
            from: 0,
            to: 2 * Math.PI,
            duration: 4000,
            ease: "Linear",
            loop: -1,
            onUpdate: (tween) => {
                const sinVal = Math.sin(tween.getValue()) * moveAnimateMax;
                this.iconPressMove.setY(sinVal + yDefaultPressMove);
                this.iconLayout.setY(-sinVal + yDefaultLayout);
            }
        });
    }

    public override setTotalVisible(visible: boolean): void {
        super.setTotalVisible(visible);
        if(!visible) this.tween.stop();
    }
}