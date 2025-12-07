import { newGame } from "./interface/game";

async function loadGame() {
    // TODO:
  newGame();
//   const futureStates = await playUntilHuman();
//   await renderWithDelays(futureStates);
}



document.addEventListener("DOMContentLoaded", async () => {
  await loadGame();
});
