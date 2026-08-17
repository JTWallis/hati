import { OVERLAY_OPTIONS_KEY } from "../../constants/keys";
import { SCREEN_WIDTH } from "../../constants/world";
import { OptionsDom } from "./html/options-dom";
import { Overlay } from "./overlay";

export class OptionsOverlay extends Overlay {
    private dom: OptionsDom;

    constructor(scene: Phaser.Scene, onFpsChecked: (checked: boolean) => void, onBgFadeChanged: (value: number) => void) {
        super(scene, 0, 0, OVERLAY_OPTIONS_KEY);

        const padding = 2;

        this.setPosition(
            SCREEN_WIDTH - this.background.width/2 - padding,
            this.background.height/2 + padding
        );

        this.dom = new OptionsDom(
            scene,
            this.x,
            this.y,
            onFpsChecked,
            onBgFadeChanged,
            () => {},
            () => {}
        );
    }

    public override setTotalVisible(visible: boolean): void {
        super.setTotalVisible(visible);
        this.dom.setVisible(visible);
    }
}