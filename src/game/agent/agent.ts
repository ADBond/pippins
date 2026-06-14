import { GameState } from "../gamestate";
import { modelName } from "../models";
import { randomAgent } from "./random";
import { nnAgent } from "./nn";
import { ismctsAgent } from "./ismcts/agent";

export interface ComputerAgent {
    chooseMove: (gameState: GameState, legalMoveIndices: number[]) => Promise<number>
}

export type Agent = ComputerAgent | 'human';
export type AgentName = 'human' | 'random' | 'ismcts1000' | modelName;

export function agentLookup(name: AgentName): Agent {
    if (name === 'human') {
        return name;
    } else if (name === 'random') {
        return randomAgent;
    } else if (name === 'ismcts1000') {
        return ismctsAgent(1000, randomAgent);
    }
    return nnAgent(name);
}
