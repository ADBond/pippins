import { Game } from "../game/game";

let game: Game;

export function newGame(): void {
    game = new Game(
        ['human', 'saltcote_pippins', 'saltcote_pippins', 'saltcote_pippins'],
        {},
    );
}

export function getGame(): Game {
    if (!game) console.log("Error getting game! None found!");
    return game;
}
