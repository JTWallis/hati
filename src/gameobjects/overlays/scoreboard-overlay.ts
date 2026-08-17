import { OVERLAY_SCOREBOARD_KEY } from "../../constants/keys";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants/world";
import { Score } from "../../models/score";
import type { ScoreResponse } from "../../models/score-response";
import { ScoreboardDom } from "./html/scoreboard-dom";
import { Overlay } from "./overlay";

const MAX_LABELS = 11;
const MAX_CHARS = 4;
const MAX_SCORE_DIGITS = 6;
const MAX_SCORE = 999_999;
const MAX_RANK_DIGITS = 4;
const MAX_RANK = 9999;

export class ScoreboardOverlay extends Overlay {

    private postScore: (score: Score) => Promise<ScoreResponse[]>;
    private fetchTopTen: () => Promise<ScoreResponse[]>;
    private cachedTopTen: ScoreResponse[] | null;   // Reload after submitting a score thats within top ten
    private dom: ScoreboardDom;
    private points: number = -1;
    private submittedScore: boolean = false;

    constructor(
        scene: Phaser.Scene,
        postScore: (score: Score) => Promise<ScoreResponse[]>,
        fetchTopTen: () => Promise<ScoreResponse[]>,
        restartGame: () => void,
    ) {
        super(scene, SCREEN_WIDTH/2, SCREEN_HEIGHT/2, OVERLAY_SCOREBOARD_KEY);
        this.postScore = postScore;
        this.fetchTopTen = fetchTopTen;

        this.dom = new ScoreboardDom(this.scene, this.x, this.y, restartGame, (name) => this.onSubmitScore(name));


        // https://docs.phaser.io/phaser/concepts/gameobjects/dom-element
        /*
        this.setSize(32, 32);
        this.setInteractive();
        this.on("pointerdown", () => console.warn("Clicked container"));
        */

    }

    public override setTotalVisible(visible: boolean) {
        super.setVisible(visible);
        this.dom.setVisible(visible);
        this.dom.clearInput();
    }

    public setPlayerPoints(playerPoints: number) {
        playerPoints = Math.floor(playerPoints);
        playerPoints = Math.min(playerPoints, MAX_SCORE);
        this.points = playerPoints;
        this.submittedScore = false;
        this.setLabel("YOU", playerPoints.toString(), "-", 0, true);
    }

    public loadTopTen() {
        if(this.cachedTopTen == null) {
            this.fetchTopTen()
                .then((scoreboard) => {
                    this.cachedTopTen = scoreboard;
                    this.onFetchedScoreboard(scoreboard);
                })
                .catch(() => {
                    console.info("Top-ten will not be loaded: Failed to fetch data");
                });
        } else {
            this.onFetchedScoreboard(this.cachedTopTen);
        }
    }

    /**
     * Populates the grid of spans with data from the received scoreboard than can hold up to ten scores.
     * The grid holds an additional, 11th row. This is used to either:
     * - Show the player-score at the bottom, should they not be included in the fetched scoreboard
     * - Show a gap, reading "...", between the rank-5 score and its followed score, if it's higher than rank-6
     * @param scoreboard The fetched scoreboard, holding up to ten scores that may or may not include the player
     * @param playerScore The locally posted player score. Used to identify the player-score within the passed scoreboard 
     */
    private onFetchedScoreboard(scoreboard: ScoreResponse[], playerScore?: Score) {
        const tenSlots = 10;
        let name: string;
        let points: string;
        let rank: string;
        let playerFound = false;
        let matchesPlayer: boolean;
        let labelIndex = 0;
        let prevRank: number = 0;

        for(let i = 0; i < tenSlots; i++) {
            if(i < scoreboard.length) {
                const score = scoreboard[i];

                if(prevRank >= 0) {
                    if(score.rank - prevRank > 1) {
                        this.setLabel("", "", "...", labelIndex++, false);
                        prevRank = -1;
                    }
                    prevRank = score.rank;
                }

                prevRank = score.rank;
                
                name = score.name.toString();
                points = score.score.toString();
                rank = Math.min(score.rank, MAX_RANK).toString();
                matchesPlayer = playerScore !== undefined && !playerFound && score.name === playerScore.name && score.name === playerScore.name;
                if(matchesPlayer) playerFound = true;
            } else {
                name = "";
                points = "";
                rank = "";
                matchesPlayer = false;
            }

            this.setLabel(name, points, rank, labelIndex, matchesPlayer);
            labelIndex++;
        }

        // Populated top-ten without player. There should still be one last slot left.
        if(!playerFound && MAX_LABELS - labelIndex >= 1) {
            this.setLabel("YOU", this.points.toString(), "-", labelIndex, true);
        }
    }

    private onSubmitScore(name: string) {
        if(this.points < 0) return;
        if(this.submittedScore) return;
        this.submittedScore = true;

        const score = new Score(name, this.points);
        this.postScore(score).then((scoreboard) => this.onFetchedScoreboard(scoreboard, score));
    }

    private setLabel(name: string, points: string, rank: string, index: number, isPlayer: boolean) {
        const namePad = name.padEnd(MAX_CHARS, " ");
        const pointsPad = (points.length > 0) ? points.padStart(MAX_SCORE_DIGITS, "0") : points;
        const rankPad = rank.padEnd(MAX_RANK_DIGITS, " ");

        this.dom.setScore(index, rankPad, namePad, pointsPad, isPlayer);
    }
}