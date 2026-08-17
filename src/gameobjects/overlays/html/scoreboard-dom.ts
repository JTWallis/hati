import * as Phaser from "phaser";
import { HTML_SCOREBOARD_KEY } from "../../../constants/keys";

const COLOR_PLAYER = "#AA8822";
const COLOR_OTHERS = "#000000";

export class ScoreboardDom extends Phaser.GameObjects.DOMElement {

    private divScores: HTMLDivElement;
    private inputName: HTMLInputElement;
    private buttonRestart: HTMLButtonElement;
    private buttonUpload: HTMLButtonElement;
    private flashEvent: Phaser.Time.TimerEvent | null;
    private onUploadClick: (name: string) => void;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        onRestartClick: () => void,
        onUploadClick: (name: string) => void
    ) {
        super(scene, x, y);
        this.createFromCache(HTML_SCOREBOARD_KEY);
        scene.add.existing(this);

        this.onUploadClick = onUploadClick;
        this.divScores = this.getChildByID("scoreboardScores") as HTMLDivElement;
        this.inputName = this.getChildByID("scoreboardInputName") as HTMLInputElement;
        this.buttonRestart = this.getChildByID("scoreboardBtnRestart") as HTMLButtonElement;
        this.buttonUpload = this.getChildByID("scoreboardBtnUpload") as HTMLButtonElement;

        this.inputName.addEventListener("input", (e: InputEvent) => this.onInput(e));
        this.buttonRestart.addEventListener("click", () => onRestartClick());
        this.buttonUpload.addEventListener("click", () => this.onUpload());

        this.setScrollFactor(0);
    }

    public clearInput() {
        this.inputName.value = "";
    }

    public setScore(row: number, rank: string, name: string, points: string, isPlayer: boolean) {
        const rowIndex = row * 3;
        const spans = Array.from({length: 3}, (_, i) => this.divScores.children.item(rowIndex + i) as HTMLSpanElement);
        const strings = [rank, name, points];

        spans.forEach((span, i) => {
            span.textContent = strings[i];
            span.style.color = isPlayer ? COLOR_PLAYER : COLOR_OTHERS;
        })
    }

    private isInputValid(text: string, sanitized: string): boolean {
        if(!text) text = this.inputName.textContent;
        if(!sanitized) sanitized = this.getSanitizedInput(text);

        return sanitized.length <= 4 && text.length <= sanitized.length;
    }

    private getSanitizedInput(text: string): string {
        return text
            .trim()
            .replace(/[^a-zA-Z!-@_~€]/g, "")
            .toUpperCase();
    }

    private flashInvalidInput() {
        this.inputName.style.backgroundColor = "#FF4444";

        if(this.flashEvent) {
            this.flashEvent.remove();
        }

        this.flashEvent = this.scene.time.delayedCall(1000, () => {
            this.inputName.style.backgroundColor = "#FFFFFF";
            this.flashEvent = null;
        });        
    }

    private onInput(e: InputEvent) {
        const text = (e.target as HTMLInputElement).value;
        const sanitized = this.getSanitizedInput(text);

        if(!this.isInputValid(text, sanitized)) {
            this.flashInvalidInput();
        }

        this.inputName.value = sanitized.slice(0, 4);
    }

    private onUpload() {
        const text = this.inputName.value;
        const sanitized = this.getSanitizedInput(text);

        if(!this.isInputValid(text, sanitized)) {
            this.flashInvalidInput();
        } else {
            this.onUploadClick(sanitized.slice(0, 4));
        }
    }
}