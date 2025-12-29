import { createCardElement } from './ui';
import { GameStateForUI, state } from '../game/gamestate';
import {PlayerName, playerNameArr } from '../game/player';
import { onHumanPlay } from './api';


export async function renderState(state: GameStateForUI) {

  const handEl = document.getElementById('player-hand')!;
  const playerHand = state.hands.player;
  playerHand.sort(
    (c1, c2) => (
      // 100 big enough to ensure we always sort by suit first
      100*(c1.suit.rankForTrumpPreference - c2.suit.rankForTrumpPreference) +
      (c1.rank.trickTakingRank - c2.rank.trickTakingRank)
    )
  );
  handEl.innerHTML = '';
  playerHand.forEach(card => {
    handEl.appendChild(
      createCardElement(card.toStringShort(), state.whoseTurn === "player" ? (() => onHumanPlay(state, card)) : undefined)
    )
  });

  playerNameArr.forEach(p => {
    const playedEl = document.getElementById(`played-${p}`)!;
    playedEl.innerHTML = '';
    const card = state.played[p as PlayerName];
    const el = createCardElement(card !== null ? card.toStringShort(): "");
    el.classList.add('played-card');
    playedEl.appendChild(el);
  });

  playerNameArr.forEach(p => {
    const prevEl = document.getElementById(`prev-${p}`)!;
    prevEl.innerHTML = '';
    const card = state.previous[p as PlayerName];
    const el = createCardElement(card !== null ? card.toStringShort(): "");
    el.classList.add('played-card');
    prevEl.appendChild(el);
  });


  // game status - config
  // and current status
  document.getElementById('hand-number')!.innerText = `(hand #${state.handNumber})`;

  // const trumpEl = document.getElementById('trumps')!;
  // trumpEl.innerHTML = '';
  // trumpEl.appendChild(createSuitElement(state.trumps ? state.trumps.toStringShort() : ""));

  // TODO: populate the scores in the UI

  // document.getElementById('debug')!.innerText = `${state.gameState}`;

}

const delayMap: Record<state, number> = {
  game_initialise: 10,
  play_card: 700,
  discarding: 700,
  trick_complete: 1700,
  hand_complete: 3000,
  new_hand: 10,
  game_complete: 10,
}

export async function renderWithDelays(states: GameStateForUI[]) {
  for (const state of states) {
    await renderState(state);
    await wait(delayMap[state.gameState]);
  }
}


function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
