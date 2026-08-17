import * as Phaser from "phaser";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants/world";

const SCROLL_INCR = 0.2;
const MAX_SCROLL_INCR = 5.0;
const SCROLL_SPEED_BASE = 4;
const SCROLL_SPEED_MAX = 16;
const SCROLL_SPEED_DIFFICULTY_ADD = 0.8;
const BOUND_WIDTH = SCREEN_WIDTH * 2;
const RELATIVE_X_FORCE_SCROLL = 0.4;

let currentScrollMultiplier = SCROLL_SPEED_BASE;

export type SetBoundsCallback = (x: number, width: number) => void;

export class CameraManager {

    private camera: Phaser.Cameras.Scene2D.Camera;

    private getPlayerX: () => number;
    private isFreeze = false;

    private minBoundX: number = 0.0;

    constructor(camera: Phaser.Cameras.Scene2D.Camera, getPlayerXCallback: () => number) {
        this.camera = camera;
        this.getPlayerX = getPlayerXCallback;

        this.setBounds();
        this.camera.scrollX = 0.0;
    }

    public update(): void {
        if(this.isFreeze) return;

        const catchUpIncrement = this.getCatchUpIncrement();
        this.scroll(catchUpIncrement * currentScrollMultiplier);
    }

    public setDifficulty(difficulty: number) {
        const newScrollSpeed = SCROLL_SPEED_BASE + SCROLL_SPEED_DIFFICULTY_ADD * difficulty;
        currentScrollMultiplier = Phaser.Math.Clamp(
            newScrollSpeed,
            SCROLL_SPEED_BASE,
            SCROLL_SPEED_MAX
        );
    }

    private getCatchUpIncrement(): number {
        const relativePlayerX = ( this.getPlayerX() - this.minBoundX ) / SCREEN_WIDTH;

        if (relativePlayerX < RELATIVE_X_FORCE_SCROLL) return SCROLL_INCR;

        return Phaser.Math.Interpolation.SmoothStep(
            relativePlayerX - RELATIVE_X_FORCE_SCROLL,
            SCROLL_INCR,
            MAX_SCROLL_INCR
        );
    }

    private scroll(increment: number): void {
        const delta = this.camera.scene.game.loop.delta;
        this.minBoundX += increment / this.getTimeScale() * (delta / 10);
        this.camera.scrollX = this.minBoundX;

        this.setBounds();
    }

    private setBounds(): void {
        this.camera.setBounds(this.minBoundX, 0, BOUND_WIDTH, SCREEN_HEIGHT, false);
        this.camera.scene.physics.world.setBounds(this.minBoundX, 0, BOUND_WIDTH, SCREEN_HEIGHT)
    }

    public cleanup() {
        this.minBoundX = 0;
        this.camera.scrollX = 0;
        this.setBounds();
    }

    public setFreeze(isFreezed: boolean) {
        this.isFreeze = isFreezed;
    }

    public getBoundLeft(): number {
        return this.minBoundX;
    }

    private getTimeScale(): number {
        return this.camera.scene.physics.world.timeScale;
    }

}