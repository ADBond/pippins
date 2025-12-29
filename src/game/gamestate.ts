import { Card, Suit, getFullPack, shuffle } from "./card";
import { Player, PlayerName, playerNameArr } from "./player";
import { Agent, AgentName, agentLookup } from "./agent/agent";

export type GameConfig = {
}

export type state = 'game_initialise' | 'discarding' | 'play_card' | 'trick_complete' | 'hand_complete' | 'new_hand' | 'game_complete';

export class GameState {
    public dealerIndex: number;
    public currentPlayerIndex: number;
    public leaderIndex: number | null = null;
    public pack: Card[] = getFullPack();

    public trumpCards: Card[] = [];
    public players: Player[] = [];
    public trickIndex: number;
    public trickInProgress: [Card, Player][] = [];
    public discards: [Card, Player][] = [];

    public handNumber: number = 0;
    public currentState: state = 'game_initialise';

    public previousTrick: [Card, Player][] = [];
    // last_trick_card_scores: list[int] = field(default_factory=list)

    constructor(public playerNames: AgentName[], public config: GameConfig) {
        // TODO: more / flexi ??
        const playerConfig: PlayerName[] = ['player', 'comp1', 'comp2', 'comp3'];
        const agents: Agent[] = playerNames.map((name) => agentLookup(name));
        this.players = playerNames.map(
            (name, i) => new Player(
                name,
                playerConfig[i],
                agents[i],
                i,
            )
        )
        // choose a random initial dealer
        this.dealerIndex = Math.floor(Math.random() * playerNames.length);
        // dummy values:
        this.currentPlayerIndex = 0;
        this.trickIndex = 0;
    }

    public async increment() {
        const state = this.currentState;
        console.log(`Incrementing state - currently: ${state}`);
        switch (state) {
            case 'game_initialise':
                this.dealCards();
                break;
            case 'play_card':
                const _moveIndex = await this.computerMove();
                break;
            case 'discarding':
                const _discardIndex = await this.computerDiscard();
                break;
            case 'trick_complete':
                this.resetTrick();
                break;
            case 'hand_complete':
                // this.updateScores(log);
                // if (this.escalations >= this.playTo) {
                //     this.currentState = "gameComplete";
                // } else {
                //     this.previousSpoils = this.spoils.slice();
                //     this.dealerIndex = this.getNextPlayerIndex(this.dealerIndex);
                //     this.dealCards(this.pack, log);
                // }
                break;
            case 'game_complete':
                break;
            default:
            // error!
        }
    }

    get cardsPerHand(): number {
        return 12;
    }

    get numTrumps(): number {
        return this.trumpCards.length;
    }

    get trumps(): Suit[] {
        return this.trumpCards.map(
            (card) => card.suit
        )
    }

    get topTrumpRankValue(): number {
        if (this.trumpCards.length === 0) {
            // this is an arbitrary number below any suit value
            return -10;
        }
        // final array card - highest value
        return this.trumpCards[this.numTrumps - 1].rank.trickTakingRank;
    }

    get trickInProgressCards(): Card[] {
        return this.trickInProgress.map(
            ([card, _player]) => card
        );
    }

    get currentLedSuit(): Suit | null {
        const trickInProgressCards = this.trickInProgressCards;
        if (trickInProgressCards.length === 0) {
            return null;
        }
        return trickInProgressCards[0].suit;
    }

    get legalMoveIndices(): number[] {
        let legalCards: Card[];
        const hand = this.currentPlayerHand;
        const ledSuit = this.currentLedSuit;
        if (ledSuit === null) {
            // if there is no card led, anything is legal
            legalCards = hand;
        } else {
            // must follow suit if we can
            legalCards = hand.filter(card => Suit.suitEquals(card.suit, ledSuit));
            if (legalCards.length === 0) {
                // if we have no cards of led suit, anything is legal
                legalCards = hand;
            }
        }
        return legalCards.map(card => card.index);
    }

    getPlayer(name: PlayerName): Player {
        return this.players.filter(
            (player) => player.name === name
        )[0];
    }

    private getPlayedCard(name: PlayerName, trick: [Card | null, Player][]): Card | null {
        const playerPlayedCards = trick.filter(
            ([_card, player]) => player.name === name
        );
        const numCards = playerPlayedCards.length;
        if (numCards === 1) {
            return playerPlayedCards[0][0];
        }
        if (numCards > 1) {
            console.log(`getPlayedCard error: ${playerPlayedCards}`);
        }
        return null;
    }

    get played(): Record<PlayerName, Card | null | 'back'> {
        let played;
        if (this.currentState === 'discarding') {
            played = Object.fromEntries(
                playerNameArr.map((name): [PlayerName, Card | null | 'back'] => [
                    name, this.getPlayedCard(name, this.discards) === null ? null : 'back'
                ])
            ) as Record<PlayerName, Card | 'back' | null>;
        } else {
            played = Object.fromEntries(
                playerNameArr.map((name): [PlayerName, Card | null | 'back'] => [
                    name, this.getPlayedCard(name, this.trickInProgress)
                ])
            ) as Record<PlayerName, Card | 'back' | null>;
        }

        return played;
    }

    get previous(): Record<PlayerName, Card | null> {
        let fromArr: [Card | null, Player][];
        if (this.currentState === 'discarding') {
            fromArr = this.players.map(
                (player) => [null, player]
            )
        }
        else if (this.previousTrick.length === 0){
            fromArr = this.discards;
        } else {
            fromArr = this.previousTrick;
        }
        return Object.fromEntries(
            playerNameArr.map((name): [PlayerName, Card | 'back' | null] => [
                name,
                this.getPlayedCard(name, fromArr)
            ]
        )
        ) as Record<PlayerName, Card | null>;

    }

    get currentPlayer(): Player {
        return this.players[this.currentPlayerIndex];
    }

    get currentPlayerHand(): Card[] {
        return this.currentPlayer.hand;
    }

    get humanHand(): Card[] {
        // TODO: don't fix index of human player, maybe?
        return this.getPlayerHand(0);
    }

    get numPlayers(): number {
        return this.players.length;
    }

    getNextPlayerIndex(playerIndex: number): number {
        return ((playerIndex + 1) % this.numPlayers);
    }

    public trickWinnerPlayer(trumpSuits: Suit[]): Player {
        const winningCardPlay = this.trickInProgress.filter(
            ([card, player]) => Card.cardEquals(card, this.winningCard(trumpSuits))
        );
        // TODO: length check?
        const trickWinner = winningCardPlay[0][1];
        return trickWinner;
    }


    public winningCard(trumpSuits: Suit[]): Card {
        const trumpCardsPlayed = this.trickInProgress.filter(
            ([card, _player]) => trumpSuits.map(
                (trumpSuit) => Suit.suitEquals(card.suit, trumpSuit)
            ).some(Boolean)
        );
        let winningCard: Card | null = null;
        if (trumpCardsPlayed.length > 0) {
            let trumpsHighToLow = [...trumpSuits].reverse();
            for (const trumpSuit of trumpsHighToLow) {
                const thisTrumpSuitCardsPlayed: [Card, Player][] = trumpCardsPlayed.filter(
                    ([card, player]) => Suit.suitEquals(card.suit, trumpSuit)
                )
                if (thisTrumpSuitCardsPlayed.length > 0) {
                    winningCard = Card.singleHighestCard(trumpCardsPlayed.map(([card, _player]) => card));
                    break;
                }
            }
        } else {
            const ledCardsPlayed = this.trickInProgress.filter(
                ([card, _player]) => Suit.suitEquals(card.suit, this.currentLedSuit as Suit)
            );
            winningCard = Card.singleHighestCard(ledCardsPlayed.map(([card, _player]) => card))
        }
        if (winningCard === null) {
            // TODO: error
            throw new Error('severe card winner error');
        }
        return winningCard;
    }

    get isPenultimateTrick(): boolean {
        return this.trickIndex === (this.cardsPerHand - 2);
    }

    get isFinalTrick(): boolean {
        return this.trickIndex === (this.cardsPerHand - 1);
    }

    get handNotFinished(): boolean {
        return this.players.map(
            (player) => player.hand
        ).some(
            (hand) => hand.length > 0
        );
    }

    private async computerMove(): Promise<number> {
        const agent = this.currentPlayer.agent;
        if (agent === 'human') {
            // TODO: error
            console.log("Error: trying to move for a human")
            return -20;
        }
        if (this.currentState !== 'play_card') {
            // TODO: error
            console.log(`Error: can't play card in ${this.currentState}`)
            return -20;
        }

        const currentLegalMoves = this.legalMoveIndices;
        const cardToPlayIndex = await agent.chooseMove(this, currentLegalMoves);
        const cardToPlay = Card.cardFromIndex(cardToPlayIndex, this.pack)

        if (!this.playCard(cardToPlay)) {
            console.log("Error playing card");
        }
        return cardToPlayIndex;
    }

    private async computerDiscard(): Promise<number> {
        const agent = this.currentPlayer.agent;
        if (agent === 'human') {
            // TODO: error
            console.log("Error: trying to move for a human")
            return -20;
        }
        if (this.currentState !== 'discarding') {
            // TODO: error
            console.log(`Error: can't discard in ${this.currentState}`)
            return -20;
        }

        // naive legal moves are indexed for 'playing' - shift by 52 for discard encoding
        const currentLegalMoves = this.legalMoveIndices.map(
            (index) => 52 + index
        );
        console.log('Ready to chose a move...');
        const moveIndex = await agent.chooseMove(this, currentLegalMoves);
        console.log('Chosen!');
        // translate move back to card index
        const cardToPlayIndex = moveIndex - 52;
        const cardToPlay = Card.cardFromIndex(cardToPlayIndex, this.pack)

        if (!this.makeDiscard(cardToPlay)) {
            console.log("Error playing card");
        }
        return cardToPlayIndex;
    }

    giveCardToPlayer(playerIndex: number, card: Card) {
        this.players[playerIndex].hand.push(card);
    }

    getPlayerHand(playerIndex: number): Card[] {
        return this.players[playerIndex].hand ?? [];
    }

    makeDiscard(card: Card): boolean {
        console.log(`Discarding ${card}`)
        if (!this.legalMoveIndices.includes(card.index)) {
            console.log(`Error: Cannot discard illegal card ${card}`);
            return false;
        }
        const player = this.currentPlayer;
        const hand = player.hand;
        if (!hand) {
            console.log("Error: I couldn't find a hand!");
            return false;
        }

        const index = hand.findIndex(
            c => c.rank === card.rank && c.suit === card.suit
        );
        if (index < 0) {
            console.log(`Error: I couldn't find a the card in hand ${hand}`);
            return false;
        }
        const [playedCard] = hand.splice(index, 1);
        this.discards.push([playedCard, player]);

        if (this.discards.length === this.numPlayers) {
            this.currentState = "play_card";
        }
        const newCurrentPlayerIndex = this.getNextPlayerIndex(this.currentPlayerIndex);
        this.currentPlayerIndex = newCurrentPlayerIndex;
        console.log('happy discard path');
        return true;
    }

    playCard(card: Card): boolean {
        if (!this.legalMoveIndices.includes(card.index)) {
            console.log(`Error: Cannot play illegal card ${card}`);
            return false;
        }
        const player = this.currentPlayer;
        const hand = player.hand;
        if (!hand) {
            console.log("Error: I couldn't find a hand!");
            return false;
        }

        const index = hand.findIndex(
            c => c.rank === card.rank && c.suit === card.suit
        );
        if (index < 0) {
            return false;
        }
        const [playedCard] = hand.splice(index, 1);
        this.trickInProgress.push([playedCard, player]);

        if (this.trickInProgress.length === this.numPlayers) {
            this.currentState = "trick_complete";
            return true;
        }
        const newCurrentPlayerIndex = this.getNextPlayerIndex(this.currentPlayerIndex);
        this.currentPlayerIndex = newCurrentPlayerIndex;
        return true;
    }

    // TODO: seed?
    dealCards(): void {
        const pack = getFullPack();
        shuffle(pack);
        for (let i = 0; i < 13; i++) {
            // for (const player of this.state.players) {
            // TODO: loop this properly!
            for (let playerIndex = 0; playerIndex < this.numPlayers; playerIndex++) {
                const card = pack.pop();
                if (card) this.giveCardToPlayer(playerIndex, card);
            }
        }

        // TODO now pack should be empty
        console.log("Empty pack:");
        console.log([...pack]);
        console.log([...this.getPlayerHand(0)]);
        console.log([...this.getPlayerHand(1)]);
        console.log([...this.getPlayerHand(2)]);
        console.log([...this.getPlayerHand(3)]);
        this.trumpCards = [];
        // TODO: could adjust this in config:
        this.currentState = 'discarding';
        this.currentPlayerIndex = this.getNextPlayerIndex(this.dealerIndex);
        this.handNumber++;
        this.trickIndex = 0;
    }

    resetTrick(): void {
        const winnerPlayer = this.trickWinnerPlayer(this.trumps);
        this.currentPlayerIndex = winnerPlayer.positionIndex;
        // TODO: scores
        this.updateTrumps();

        this.previousTrick = this.trickInProgress
        // empty the trick, and increment the counter!
        this.trickInProgress = [];
        this.trickIndex++;
        if (this.handNotFinished) {
            this.currentState = "play_card";
        } else {
            this.currentState = "hand_complete";
        }
    }

    updateTrumps(): void {
        const cardsAboveTrumps = this.trickInProgress.filter(
            ([card, player]) => card.rank.trickTakingRank > this.topTrumpRankValue
        ).map(([card, player]) => card);
        if (cardsAboveTrumps.length === 0) {
            return;
        }
        const lowestCardNotBelowTrumps = Card.lowestCards(cardsAboveTrumps);
        // in case of ties, last played 'wins'
        const newTrump = lowestCardNotBelowTrumps[lowestCardNotBelowTrumps.length - 1];
        // remove existing cards of this suit
        this.trumpCards.filter(
            (card) => !Suit.suitEquals(card.suit, newTrump.suit)
        )
        this.trumpCards.push(newTrump);
    }

    getStateForUI(): GameStateForUI {
        return ({
            hands: { comp1: [], player: this.currentState === "hand_complete" ? [] : this.humanHand.slice(), comp2: [], comp3: [] },
            trumpCards: this.trumpCards,
            played: this.played,
            previous: this.previous,

            gameState: this.currentState,
            whoseTurn: this.currentPlayer.name,
            handNumber: this.handNumber,
        })
    }
}

export interface GameStateForUI {
    hands: Record<PlayerName, Card[]>;
    played: Record<PlayerName, Card | null | 'back'>;
    previous: Record<PlayerName, Card | null>;

    handNumber: number;
    trumpCards: Card[];

    gameState: state;
    whoseTurn: PlayerName;
}
