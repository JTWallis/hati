import { Score } from "./score";

export class ScoreResponse extends Score {
    public rank: number;

    constructor(name: string, score: number, rank: number) {
        super(name, score);
        this.rank = rank;
    }
}