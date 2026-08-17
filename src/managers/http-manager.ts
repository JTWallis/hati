import { Score } from "../models/score";
import type { ScoreResponse } from "../models/score-response";

const URL = import.meta.env.VITE_BACKEND_URL;

export class HttpManager {

    /**
     * Submits the passed score to the backend and returns a scoreboard with 10 scores, 
     * consisting of the top-5, the player's rank and the rest populated with scores
     * neighboring to the player.
     * 
     * The score submission at this moment is a raw POST, so there is no form of
     * cheating prevention yet ( though shame on you if you want to cheat on a browser minigame :} )
     * @param score A score consisting of a valid input username and the acquired points
     * @returns Scoreboard of up to 10 scores
     */
    public async postScore(score: Score): Promise<ScoreResponse[]> {
        try {
            const response = await fetch(
                `${URL}`, 
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(score)
                }
            );

            const json = await response.json();

            if(!response.ok) {
                throw new Error(`${response.status}, ${json.message}`)
            }

            return json as ScoreResponse[];
        } catch(err: any) {
            console.error(`Could not save score: ${err.message}`);
        }
    }

    public async fetchTopTen(): Promise<ScoreResponse[]> {
        try {
            const response = await fetch(
                `${URL}/topten`, 
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                }
            );
                
            const json = await response.json();

            if(!response.ok) {
                throw new Error(`${response.status}, ${json.message}`)
            }

            return json as ScoreResponse[];
        } catch(err: any) {
            console.error(`Could not fetch top-ten: ${err.message}`);
        }
    }
}