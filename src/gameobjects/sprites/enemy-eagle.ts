import { ENTITY_EAGLE_KEY } from "../../constants/keys";
import { ScoreType } from "../../enums/score-type";
import { Enemy } from "./enemy";

export class EnemyEagle extends Enemy {

    constructor(scene: Phaser.Scene) {
        super(scene, ENTITY_EAGLE_KEY);
        this.setBodySizeOffset(16, 16, 8, 16);
    }

    public getScoreType(): ScoreType {
        return ScoreType.KILL_EAGLE;
    }

}