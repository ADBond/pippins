import { Card } from "../game/card";
import { GameStateForUI } from "../game/gamestate";
import { renderWithDelays } from "./render";
import { getGame } from "./game";

export function playCard(state: GameStateForUI, card: Card): void {
    const game = getGame();
    game.state.playCard(card);
}

export async function onHumanPlay(state: GameStateForUI, card: Card) {
    playCard(state, card);
    const futureStates = await playUntilHuman();
    await renderWithDelays(futureStates);
}

export async function playUntilHuman(): Promise<GameStateForUI[]> {
    let game = getGame();
    let current = game.getGameStateForUI();
    const states: GameStateForUI[] = [current];

    // getout for infinite loop
    let counter = 0;

    while (
        (!['playCard', 'gameComplete'].includes(current.gameState)
        || !(current.whoseTurn === "player"))
        && counter < 50
    ) {
        game = getGame()
        await game.incrementState();
        current = game.getGameStateForUI();
        states.push(current);
        counter++;
    }

    return states;
}
