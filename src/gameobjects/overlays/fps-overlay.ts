import { HTML_FPS_KEY } from "../../constants/keys";
import { SCREEN_WIDTH } from "../../constants/world";
import { Overlay } from "./overlay";

export class FpsOverlay extends Overlay {

    private dom: Phaser.GameObjects.DOMElement;
    private spanFps: HTMLSpanElement;

    constructor(scene: Phaser.Scene) {
        super(scene, SCREEN_WIDTH, 0);

        this.dom = scene.add.dom(SCREEN_WIDTH - 8, 8).createFromCache(HTML_FPS_KEY);
        this.spanFps = this.dom.getChildByID("fps") as HTMLSpanElement;

        this.dom.setScrollFactor(0);
    }

    public setFps(fps: number) {
        this.spanFps.textContent = fps.toString();
    }

    public override setTotalVisible(visible: boolean) {
        super.setVisible(visible);
        this.dom.setVisible(visible);
    }
}