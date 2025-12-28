import { Card, getFullPack } from "./card";
import { Player, PlayerName } from "./player";
import { Agent, AgentName, agentLookup } from "./agent/agent";

export type GameConfig = {
}

export type state = 'game_initialise' | 'discarding' | 'play_card' | 'trick_complete' | 'hand_complete' | 'game_complete';

export class GameState {
    public dealerIndex: number;
    public currentPlayerIndex: number;
    public leaderIndex: number | null = null;
    public pack: Card[] = getFullPack();

    public trumpCards: Card[] = [];
    public players: Player[] = [];
    public trickIndex: number;
    public trickInProgress: [Card, Player][] = [];
    public discards: Card[] = [];

    public handNumber: number = 0;
    public currentState: state = 'game_initialise';

    public previousTrick: [Card, Player][] = [];
    // last_trick_card_scores: list[int] = field(default_factory=list)

    constructor(public playerNames: AgentName[], public config: GameConfig) {
        // TODO: more / flexi ??
        const playerConfig: PlayerName[] = ['player', 'comp1', 'comp2'];
        const agents: Agent[] = playerNames.map((name) => agentLookup(name));
        this.players = playerNames.map(
            (name, i) => new Player(
                name,
                playerConfig[i],
                agents[i],
                i,
            )
        )
        for (const name of playerNames) {
            this.players.push();
        }
        // choose a random initial dealer
        this.dealerIndex = Math.floor(Math.random() * playerNames.length);
        // dummy values:
        this.currentPlayerIndex = -1;
        this.trickIndex = -1;
    }
}
