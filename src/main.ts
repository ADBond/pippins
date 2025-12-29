import { newGame } from "./interface/game";
import { playUntilHuman } from "./interface/api";
import { renderWithDelays } from "./interface/render";

async function loadGame() {
  newGame();
  const futureStates = await playUntilHuman();
  await renderWithDelays(futureStates);
}



document.addEventListener("DOMContentLoaded", async () => {
  await loadGame();
});
