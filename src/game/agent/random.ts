import { ComputerAgent } from "./agent"
import { GameState } from "../gamestate"

export const randomAgent: ComputerAgent = {
    async chooseMove(gameState: GameState, legalMoveIndices: number[]) {
        const randomIndex = Math.floor(Math.random() * legalMoveIndices.length);
        return legalMoveIndices[randomIndex];
    }
};
