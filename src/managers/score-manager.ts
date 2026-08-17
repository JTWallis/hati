import { ScoreType } from "../enums/score-type";

const MAX_SCORE = 999999;

export class ScoreManager {
    private currentScore = 0;
    private updateLayout: (added: number, total: number) => void;

    constructor(updateLayout: (added: number, total: number) => void) {
        this.reset();
        this.updateLayout = updateLayout;
    }

    public addScore(scoreType: ScoreType) {
        let addVal: number;
        switch(scoreType) {
            case ScoreType.KILL_EAGLE:
                addVal = 20;
                break;
            case ScoreType.KILL_PHOENIX:
                addVal = 50;
                break;
            case ScoreType.KILL_FIRE_PROJECTILE:
                addVal = 25;
                break;
            case ScoreType.POWERUP:
                addVal = 40;
                break;
            case ScoreType.DISTANCE:
                addVal = 10;
                break;
            default:
                return;
        }

        this.add(addVal);
    }

    private add(amount: number) {
        this.currentScore += amount;
        this.currentScore = Math.min(this.currentScore, MAX_SCORE);
        this.updateLayout(amount, this.currentScore);
    }

    public getPoints(): number {
        return this.currentScore;
    }

    public reset() {
        this.currentScore = 0;
    }

}