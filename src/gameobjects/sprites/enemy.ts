import type { ScoreType } from "../../enums/score-type";
import { SpriteSimple } from "./sprite-simple";

export abstract class Enemy extends SpriteSimple {

    constructor(scene: Phaser.Scene, texture: string | Phaser.Textures.Texture) {
        super(scene, texture, 2);
        this.setGravityY(-800);
    }

    public abstract getScoreType(): ScoreType;
}