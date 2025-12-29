import { Card } from "../game/card";
import { GameStateForUI } from "../game/gamestate";
import { renderWithDelays } from "./render";
import { getGame } from "./game";

export function playCard(card: Card): void {
    const game = getGame();
    const currentState = game.state.currentState;
    if (currentState === 'play_card') {
        game.state.playCard(card);
    } else if (currentState === 'discarding') {
        game.state.makeDiscard(card);
    } else {
        console.log('Cant move');
        console.log(currentState);
    }
}

export async function onHumanPlay(card: Card) {
    playCard(card);
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
        (!['play_card', 'discarding', 'game_complete'].includes(current.gameState)
        || !(current.whoseTurn === "player"))
        && counter < 50
    ) {
        console.log(`Looping: ${counter}`);
        game = getGame()
        await game.incrementState();
        current = game.getGameStateForUI();
        states.push(current);
        counter++;
    }
    console.log(`Human done after: ${counter}`);

    return states;
}
