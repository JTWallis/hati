import { HTML_COUNT_KEY } from "../../constants/keys";
import { CooldownOverlay } from "./cooldown-overlay";


export class CooldownCountOverlay extends CooldownOverlay {

    private domCount: Phaser.GameObjects.DOMElement;
    private spanCount: HTMLSpanElement;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        const paddingX = 16;
        const paddingY = 12;
        this.domCount = scene.add.dom(x + paddingX, y + paddingY).createFromCache(HTML_COUNT_KEY);
        this.spanCount = this.domCount.getChildByID("count") as HTMLSpanElement;

        this.domCount.setScrollFactor(0);
        this.setCount(0);
    }

    public setCount(count: number) {
        this.spanCount.textContent = count.toString();
        const visible = count > 0;
        this.domCount.setVisible(visible);
    }

    public override setTotalVisible(visible: boolean): void {
        super.setVisible(visible);
        this.domCount.setVisible(visible);
    }
}