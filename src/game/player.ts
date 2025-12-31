import { Card } from "./card";
import { Agent } from "./agent/agent";
// import { ScoreBreakdown } from "./scores";

export const playerNameArr = ['player', 'comp1', 'comp2', 'comp3'] as const;
export type PlayerName = typeof playerNameArr[number];


export class Player {
    constructor(
        public displayName: string,
        public name: PlayerName,
        public agent: Agent,
        public positionIndex: number,
        public hand: Card[] = [],
        public scores: number[] = [],
        // public scores: ScoreBreakdown[] = [],
    ) { }

    get score(): number {
        const scores = this.scores;
        return scores.length === 0 ? 0 : scores.reduce(
            (total, value) => total + value
        );
    }

    get previousScore(): number {
        return this.scores.length === 0 ? 0 : this.scores[this.scores.length - 1];
    }
}
