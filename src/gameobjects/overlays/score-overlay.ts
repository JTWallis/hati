import { HTML_SCORE_KEY } from "../../constants/keys";
import { SCREEN_WIDTH } from "../../constants/world";
import { Overlay } from "./overlay";

const SCREEN_X = SCREEN_WIDTH / 8 + 16;
const SCREEN_Y = 8;

export class ScoreOverlay extends Overlay {
    private dom: Phaser.GameObjects.DOMElement;
    private spanScore: HTMLSpanElement;

    constructor(scene: Phaser.Scene) {
        super(scene, SCREEN_X, SCREEN_Y);

        this.dom = scene.add.dom(SCREEN_X, SCREEN_Y).createFromCache(HTML_SCORE_KEY);
        this.spanScore = this.dom.getChildByID("score") as HTMLSpanElement;

        this.dom.setScrollFactor(0);
    }

    public override setTotalVisible(visible: boolean): void {
        super.setTotalVisible(visible);
        this.dom.setVisible(visible);
    }

    public setScore(total: number) {
        this.spanScore.textContent = total.toString();
    }

    public addScore(added: number, total: number) {
        this.setScore(total);
    }
}