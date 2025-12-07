import { GameConfig, GameState } from "./gamestate";

const defaultConfig: GameConfig = {}

export class Game {
  public state: GameState;
  // public logs: GameLog[] = [];
  // private currentLog: GameLog;
  // private gameID: string;
  // private playerNames: AgentName[];

  constructor(
      // playerNames: AgentName[],
      config: GameConfig = defaultConfig,
    ) {
    // this.gameID = randomID();
    // this.state = new GameState(playerNames, config);
    this.state = new GameState();
    // this.currentLog = new GameLog(this.gameID, config, playerNames, this.simulation);
    // this.playerNames = playerNames;
    // this.incrementState();
  }
}
