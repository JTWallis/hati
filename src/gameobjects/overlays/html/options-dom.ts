import * as Phaser from "phaser";
import { HTML_OPTIONS_KEY } from "../../../constants/keys";

export class OptionsDom extends Phaser.GameObjects.DOMElement {

    private checkFps: HTMLInputElement;
    private sliderBgFade: HTMLInputElement;
    private sliderSound: HTMLInputElement;
    private sliderMusic: HTMLInputElement;
    private sliderBgFadeValue: HTMLSpanElement;
    private sliderSoundValue: HTMLSpanElement;
    private sliderMusicValue: HTMLSpanElement;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        onFpsChecked: (checked: boolean) => void,
        onBgFadeChanged: (value: number) => void,
        onSoundChanged: (value: number) => void,
        onMusicChanged: (value: number) => void
    ) {
        super(scene, x, y);
        this.createFromCache(HTML_OPTIONS_KEY);
        scene.add.existing(this);

        this.checkFps = this.getChildByID("optionsFps") as HTMLInputElement;
        this.sliderBgFade = this.getChildByID("optionsBgFade") as HTMLInputElement;
        this.sliderSound = this.getChildByID("optionsSound") as HTMLInputElement;
        this.sliderMusic = this.getChildByID("optionsMusic") as HTMLInputElement;
        this.sliderBgFadeValue = this.getChildByID("optionsBgFadeValue") as HTMLSpanElement;
        this.sliderSoundValue = this.getChildByID("optionsSoundValue") as HTMLSpanElement;
        this.sliderMusicValue = this.getChildByID("optionsMusicValue") as HTMLSpanElement;

        this.checkFps.addEventListener("change", (e: InputEvent) => onFpsChecked((e.currentTarget as HTMLInputElement).checked));

        this.sliderBgFade.addEventListener("change", (e: InputEvent) => {
            const value = (e.currentTarget as HTMLInputElement).valueAsNumber;
            this.sliderBgFadeValue.textContent = `${value}s`;
            onBgFadeChanged(value);
        })

        this.sliderSound.addEventListener("change", (e: InputEvent) => {
            const value = (e.currentTarget as HTMLInputElement).valueAsNumber;
            this.sliderSoundValue.textContent = `${value}%`;
            onSoundChanged(value);
        });

        this.sliderMusic.addEventListener("change", (e: InputEvent) => {
            const value = (e.currentTarget as HTMLInputElement).valueAsNumber;
            this.sliderMusicValue.textContent = `${value}%`;
            onMusicChanged(value);
        });

        this.setScrollFactor(0);
    }

}