import { ComputerAgent } from "./agent"
import { GameState } from "../gamestate"

export const randomAgent: ComputerAgent = {
    chooseMove: (gameState: GameState, legalMoveIndices: number[]) => {
        const randomIndex = Math.floor(Math.random() * legalMoveIndices.length);
        return new Promise<number>(() => legalMoveIndices[randomIndex]);
    }
}
