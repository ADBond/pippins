import { newGame } from "./interface/game";
import { playUntilHuman } from "./interface/api";
import { renderWithDelays } from "./interface/render";
import { GameConfig } from "./game/gamestate";

async function loadGame(config: GameConfig) {
  newGame(config);
  const futureStates = await playUntilHuman();
  await renderWithDelays(futureStates);
}

const DEFAULTS: GameConfig = {
  trumpRule: "mobile",
  targetScore: 600,
};


const button = document.getElementById("new-game-button")!;
const menu = document.getElementById("new-game-menu")!;
const form = document.getElementById("new-game-form") as HTMLFormElement;

function resetValues() {
  (form.querySelector(
    `input[name="targetscore"][value="${DEFAULTS.targetScore}"]`
  ) as HTMLInputElement).checked = true;
}

document.addEventListener("DOMContentLoaded", async () => {
  resetValues();
  await loadGame(DEFAULTS);
});

button.addEventListener("click", () => {
  menu.hidden = !menu.hidden;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const targetScore = formData.get("targetscore") as string;
  const config: GameConfig = {
    trumpRule: 'mobile',
    targetScore: parseInt(targetScore),
  }

  menu.hidden = true;
  resetValues();

  await loadGame(config);
});

document.addEventListener("click", (e) => {
  if (!menu.contains(e.target as Node) && e.target !== button) {
    menu.hidden = true;
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  await loadGame(DEFAULTS);
});
