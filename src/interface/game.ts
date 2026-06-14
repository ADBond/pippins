import { AgentName } from "../game/agent/agent";
import { Game } from "../game/game";
import { GameConfig } from "../game/gamestate";

let game: Game;
let opp: AgentName = 'ismcts1000';

export function newGame(config: GameConfig): void {
    game = new Game(
        ['human', opp, opp, opp],
        config,
    );
}

export function getGame(): Game {
    if (!game) console.log("Error getting game! None found!");
    return game;
}
