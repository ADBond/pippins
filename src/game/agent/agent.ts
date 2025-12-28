import { GameState } from "../gamestate";
import { randomAgent } from "./random";

export interface ComputerAgent {
    chooseMove: (gameState: GameState, legalMoveIndices: number[]) => Promise<number>
}

export type Agent = ComputerAgent | 'human';
export type AgentName = 'human' | 'random';

export function agentLookup(name: AgentName): Agent {
    if (name === 'human') {
        return name;
    }
    return randomAgent;
    // return nnAgent(name);
}
