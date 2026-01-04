import { GameConfig, GameState, GameStateForUI } from "./gamestate";
import { AgentName } from "./agent/agent";

export const defaultConfig: GameConfig = {
  targetScore: 600,
  trumpRule: 'mobile',
}

export class Game {
  public state: GameState;
  // public logs: GameLog[] = [];
  // private currentLog: GameLog;
  // private gameID: string;
  private playerNames: AgentName[];

  constructor(
      playerNames: AgentName[],
      config: GameConfig = defaultConfig,
    ) {
    // this.gameID = randomID();
    this.state = new GameState(playerNames, config);
    // this.currentLog = new GameLog(this.gameID, config, playerNames, this.simulation);
    this.playerNames = playerNames;
  }

  async incrementState() {
    await this.state.increment();
    // if (this.currentLog.complete) {
    //   this.logs.push(this.currentLog);
    //   if (!this.simulation) {
    //     sendGameLog(this.currentLog);
    //   }
    //   this.currentLog = new GameLog(this.gameID, this.state.config, this.playerNames, this.simulation);
    // }
  }

  getGameStateForUI(): GameStateForUI {
    return this.state.getStateForUI();
  }

}
