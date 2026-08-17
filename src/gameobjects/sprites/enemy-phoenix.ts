import * as Phaser from "phaser";
import { ENTITY_PHOENIX_KEY } from "../../constants/keys";
import { SCREEN_WIDTH } from "../../constants/world";
import { ScoreType } from "../../enums/score-type";
import { Enemy } from "./enemy";

const COOLDOWN_ATTACK_MS = 1800;

export class EnemyPhoenix extends Enemy {
    private spawnFireProjectile: (x: number, y: number) => void;
    private getPlayerX: () => number;
    private attackTimer: Phaser.Time.TimerEvent;

    constructor(
        scene: Phaser.Scene,
        spawnFireProjectile: (x: number, y: number) => void,
        getPlayerX: () => number
    ) {
        super(scene, ENTITY_PHOENIX_KEY);

        this.spawnFireProjectile = spawnFireProjectile;
        this.getPlayerX = getPlayerX;

        this.attackTimer = this.scene.time.addEvent({
            loop: true,
            paused: true,
            delay: COOLDOWN_ATTACK_MS,
            callback: () => this.onAttack()
        });

        this.setBodySizeOffset(16, 16, 8, 16);

    }

    private onAttack() {
        if(this.getPlayerX() > this.x) return;
        if((this.x - this.getPlayerX()) > SCREEN_WIDTH) return;
        this.spawnFireProjectile(this.x, this.y);
    }

    public override onUse() {
        this.attackTimer.paused = false;
    }

    public override onReserve(): void {
        this.pause();
    }

    public override pause() {
        this.attackTimer.paused = true;
    }

    public getScoreType(): ScoreType {
        return ScoreType.KILL_EAGLE;
    }
}