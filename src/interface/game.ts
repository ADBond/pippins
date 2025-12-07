import { Game } from "../game/game";
import { GameConfig } from "../game/gamestate";

let game: Game;

export function newGame(): void {
    game = new Game(
        // ['human', 'arundel', 'arundel'],
        // config,
    );
}

export function getGame(): Game {
    if (!game) console.log("Error getting game! None found!");
    return game;
}
