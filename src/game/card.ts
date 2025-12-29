export class Rank {
    constructor(public name: string, public trickTakingRank: number, public score: number, public ttRankAbove: number) { }

    toString(): string {
        return this.name;
    }

    toStringShort(): string {
        return this.name[0];
    }

    toJSON() {
        return this.toStringShort();
    }

    static rankEquals(r1: Rank, r2: Rank): boolean {
        return r1.name === r2.name;
    }
}
// No trump preference (currently), but keep as it doesn't hurt, and maybe useful for index
export class Suit {
    constructor(public name: string, public rankForTrumpPreference: number, public html: string) { }

    toString(): string {
        return this.name;
    }

    toStringShort(): string {
        return this.name[0];
    }

    toJSON() {
        return this.toStringShort();
    }

    static suitEquals(s1: Suit, s2: Suit): boolean {
        return s1.name === s2.name;
    }
}

export class Card {
    constructor(public suit: Suit, public rank: Rank, public index: number) { }

    toString(): string {
        return `${this.rank.toString()} of ${this.suit.toString()}`;
    }

    toStringShort(): string {
        return `${this.rank.toStringShort()}${this.suit.toStringShort()}`;
    }

    toJSON() {
        return this.toStringShort();
    }

    get html(): string {
        return `${this.rank.toStringShort()}${this.suit.html}`;
    }

    public nextCardUp(pack: Card[]): Card {
        /*
        From a given pack, return the next card up from the current one (in suit)
        */
        const ttrRank = this.rank.ttRankAbove;
        const suit = this.suit;
        const matchingCards = pack.filter(
            card => Suit.suitEquals(card.suit, suit) && (card.rank.trickTakingRank === ttrRank)
        )
        if (matchingCards.length !== 1) {
            console.log(`Error in nextCardUp: ${matchingCards}`);
        }
        return matchingCards[0];
    }

    static cardEquals(c1: Card, c2: Card): boolean {
        return Rank.rankEquals(c1.rank, c2.rank) && Suit.suitEquals(c1.suit, c2.suit);
    }

    static cardFromIndex(index: number, pack: Card[]): Card {
        const cards = pack.filter(card => card.index === index);
        if (cards.length !== 1) {
            console.log(`Error in cardFromIndex: ${cards}`);
        }
        return cards[0];
    }

    static lowestCards(cards: Card[]): Card[] {
        const lowestRank = Math.min(...cards.map(card => card.rank.trickTakingRank));
        const lowestCards = cards.filter(
            card => card.rank.trickTakingRank === lowestRank
        )
        return lowestCards;
    }

    static singleHighestCard(cards: Card[]): Card {
        const highestRank = Math.max(...cards.map(card => card.rank.trickTakingRank));
        const highestCards = cards.filter(
            card => card.rank.trickTakingRank === highestRank
        )
        if (highestCards.length > 1) {
            // TODO: error
            console.log(`Too many highest cards: ${highestCards}`);
        }
        return highestCards[0];
    }
}

export const RANKS: Rank[] = [
    ...Array.from({ length: 9 }, (_, i) => {
        const val = i + 2;
        return new Rank(val !== 10 ? String(val) : "T", val, val, val + 1);
    }),
    new Rank("J", 11, 12, 12),
    new Rank("Q", 12, 15, 13),
    new Rank("K", 13, 18, 14),
    // Default rank above
    new Rank("A", 14, 1, 4),
];

export const SUITS: Suit[] = [
    new Suit("Diamonds", 0, "&diams;"),
    new Suit("Hearts", 1, "&hearts;"),
    new Suit("Spades", 2, "&spades;"),
    new Suit("Clubs", 3, "&clubs;"),
];

export const arbitrarySuit = SUITS[0];
export const N_SUITS = SUITS.length;

export function getFullPack(): Card[] {
    const cards = [];
    let index = 0;
    for (const rank of RANKS) {
      if (rank.name === "A") {
          rank.ttRankAbove = 2;
      }
      for (const suit of SUITS) {
        let card = new Card(suit, rank, index)
        cards.push(card);
        index++;
      }
    }
    return cards;
  }

export function shuffle(cards: Card[]) {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  }