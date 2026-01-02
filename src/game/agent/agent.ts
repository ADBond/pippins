import { GameState } from "../gamestate";
import { modelName } from "../models";
import { randomAgent } from "./random";
import { nnAgent } from "./nn";

export interface ComputerAgent {
    chooseMove: (gameState: GameState, legalMoveIndices: number[]) => Promise<number>
}

export type Agent = ComputerAgent | 'human';
export type AgentName = 'human' | 'random' | modelName;

export function agentLookup(name: AgentName): Agent {
    if (name === 'human') {
        return name;
    } else if (name === 'random') {
        return randomAgent;
    }
    return nnAgent(name);
}
