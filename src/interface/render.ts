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
  document.getElementById('config')!.innerText = `playing to ${state.target}`;
  // and current status
  document.getElementById('hand-number')!.innerText = `(hand #${state.handNumber}, trick #${state.trickNumber})`;

  const trumpsEl = document.getElementById('trump-holder')!;
  trumpsEl.innerHTML = '';
  state.trumpCards.forEach(card => {
    const el = createCardElement(card.toStringShort());
    trumpsEl.appendChild(el);
  });

  const scoresTableEl = document.getElementById('scores-table') as HTMLTableElement;
  const breakdownEl = document.getElementById('scores-breakdown') as HTMLSpanElement;

  const lastTrickScoresText = state.lastTrickCardScores.map(
    ([card, score]) => `${score} (${card.toStringShort()})`
  );
  breakdownEl.textContent = `prev: 1 + ${lastTrickScoresText.join(' + ')}`;

  const nameLookup = {
    comp2: 'Player & N',
    comp1: 'E & W',
  } as const;

  type Partnership = keyof typeof nameLookup;

  scoresTableEl.replaceChildren();

  const headerRow = document.createElement('tr');
  for (const title of ['Partnership', 'Score', 'Previous']) {
    const th = document.createElement('th');
    th.textContent = title;
    headerRow.appendChild(th);
  }
  scoresTableEl.appendChild(headerRow);

  for (const player of Object.keys(nameLookup) as Partnership[]) {
    const row = document.createElement('tr');

    const nameTd = document.createElement('td');
    nameTd.textContent = nameLookup[player];
    nameTd.classList.add('player-name');

    const scoreTd = document.createElement('td');
    scoreTd.textContent = String(state.scores[player]);

    if (state.prevScores[player] > 0) {
      scoreTd.classList.add('score-up');
    }

    const prevTd = document.createElement('td');
    prevTd.textContent = String(state.prevScores[player]);

    row.append(nameTd, scoreTd, prevTd);
    scoresTableEl.appendChild(row);
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
