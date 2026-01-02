import { createCardElement } from './ui';
import { GameStateForUI, state } from '../game/gamestate';
import { PlayerName, playerNameArr } from '../game/player';
import { onHumanPlay } from './api';


export async function renderState(state: GameStateForUI) {
  console.log(state);
  const handEl = document.getElementById('player-hand')!;
  const playerHand = state.hands.player;
  playerHand.sort(
    (c1, c2) => (
      // 100 big enough to ensure we always sort by suit first
      100 * (c1.suit.rankForTrumpPreference - c2.suit.rankForTrumpPreference) +
      (c1.rank.trickTakingRank - c2.rank.trickTakingRank)
    )
  );
  handEl.innerHTML = '';
  playerHand.forEach(card => {
    handEl.appendChild(
      createCardElement(card.toStringShort(), state.whoseTurn === "player" ? (() => onHumanPlay(card)) : undefined)
    )
  });

  playerNameArr.forEach(p => {
    const playedEl = document.getElementById(`played-${p}`)!;
    playedEl.innerHTML = '';
    const card = state.played[p as PlayerName];
    let el: HTMLElement;
    if (card === 'back') {
      el = createCardElement('back');
    } else {
      el = createCardElement(
        card !== null ? card.toStringShort() : ""
      );
      el.classList.add('played-card');
    }
    playedEl.appendChild(el);
  });

  playerNameArr.forEach(p => {
    const prevEl = document.getElementById(`prev-${p}`)!;
    prevEl.innerHTML = '';
    const card = state.previous[p as PlayerName];
    const el = createCardElement(card !== null ? card.toStringShort() : "");
    el.classList.add('played-card');
    prevEl.appendChild(el);
  });


  // game status - config
  // and current status
  document.getElementById('hand-number')!.innerText = `(hand #${state.handNumber})`;

  const trumpsEl = document.getElementById('trump-holder')!;
  trumpsEl.innerHTML = '';
  state.trumpCards.forEach(card => {
    const el = createCardElement(card.toStringShort());
    trumpsEl.appendChild(el);
  });

  // TODO: populate the scores in the UI

  const scoresEl = document.getElementById('scores')!;
  scoresEl.innerHTML = '';
  const breakdownEl = document.createElement('p');
  breakdownEl.innerText = 'last trick: (1) + ' + state.lastTrickCardScores.join(' + ');
  scoresEl.appendChild(breakdownEl);
  const nameLookup: { comp1: string, comp2: string } = {
    comp2: 'Player & N',
    comp1: 'E & W',
  };
  const representativePlayers = Object.keys(nameLookup) as (keyof typeof nameLookup)[];

  for (const player of representativePlayers) {
    const playerScoreEl = document.createElement('p');
    const nameEl = document.createElement('span');
    const scoreEl = document.createElement('span');
    nameEl.innerText = `${nameLookup[player]}`;
    nameEl.classList.add('player-name');
    playerScoreEl.appendChild(nameEl);
    scoreEl.innerText = `: ${state.scores[player]}  [${state.prevScores[player]}]`;
    playerScoreEl.append(scoreEl);

    scoresEl.appendChild(playerScoreEl);
  }
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
  console.log('rendering');
  for (const state of states) {
    console.log('render')
    console.log(state);
    await renderState(state);
    await wait(delayMap[state.gameState]);
  }
}


function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
