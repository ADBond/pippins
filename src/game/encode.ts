import '../ort-init/';
import * as ort from 'onnxruntime-web/wasm'

import { Card, N_SUITS, SUITS, packSize } from './card';
import { GameState } from "./gamestate";


function oneHotEncode(
    index: number | number[] | null | undefined,
    size: number
): Float32Array {

    const data = new Float32Array(size);

    if (index == null) {
        // already zero-filled
        return data;
    }

    data.fill(-1);

    const indices = Array.isArray(index) ? index : [index];
    for (const i of indices) {
        if (i >= 0 && i < size) {
            data[i] = 1;
        }
    }

    return data;
}

function concatFloat32(arrays: Float32Array[]): Float32Array {
    const total = arrays.reduce((s, a) => s + a.length, 0);
    const out = new Float32Array(total);

    let offset = 0;
    for (const a of arrays) {
        out.set(a, offset);
        offset += a.length;
    }
    return out;
}

export function tensorWrap(
    dataArr: Float32Array,
): ort.Tensor {
    return new ort.Tensor("float32", dataArr, [1, dataArr.length]);
}


function encodeCards(cards: Card[], packSize: number): Float32Array {
    return oneHotEncode(
        cards.map(
            (card) => {
                return card.index;
            }
        ),
        packSize,
    )
}

export interface Encoder {
    encode: (gameState: GameState) => Float32Array
}


const HandEncoder: Encoder = {
    encode: (gameState: GameState) => {
        return encodeCards(gameState.currentPlayerHand, packSize);
    }
}

const CurrentTrickEncoder: Encoder = {
    encode: (gameState: GameState) => {
        const numPlayers = gameState.numPlayers;
        const currentTrick = gameState.trickInProgressCards;
        const encodedCards = Array.from({ length: numPlayers - 1 }, (_, i) => {
            return currentTrick[i] !== undefined ? [currentTrick[i]] : [];
        }).map(
            (cards) => encodeCards(cards, packSize)
        );

        return concatFloat32(encodedCards);
    }
}


const TrickNumberEncoder: Encoder = {
    encode: (gameState: GameState) => {
        // 13 is a slight issue from the trained model, from earlier rules
        return oneHotEncode(gameState.trickIndex, 13);
    }
}

const PlayingLastEncoder: Encoder = {
    encode: (gameState: GameState) => {
        const value = gameState.trickInProgress.length === gameState.numPlayers - 1 ? 1 : 0;
        return new Float32Array([value]);
    }
}


const LedSuitEncoder: Encoder = {
    encode: (gameState: GameState) => {
        return oneHotEncode(gameState.currentLedSuit?.rankForTrumpPreference, N_SUITS);
    }
}

const _BrokenTrumpCardsEncoder: Encoder = {
    encode: (gameState: GameState) => {
        return encodeCards(gameState.trumpCards, packSize);
    }
}

const concreteEncoders = {
    hand: HandEncoder,
    currentTrick: CurrentTrickEncoder,
    trickNumber: TrickNumberEncoder,
    playingLast: PlayingLastEncoder,
    ledSuit: LedSuitEncoder,
    _brokenTrumpCards: _BrokenTrumpCardsEncoder,
}
type concreteEncoderNames = keyof typeof concreteEncoders

export class ModelEncoder {
    constructor(public encoderNames: concreteEncoderNames[]) { }

    get encoder(): Encoder {
        const MultiEncoder: Encoder = {
            encode: (gameState: GameState) => {
                const encoded = this.encoderNames.map(
                    (name) => concreteEncoders[name].encode(gameState)
                );
                const fullEncoded = concatFloat32(encoded);
                return fullEncoded;
            }
        }
        return MultiEncoder;
    }
}

export const flawedSmallModelEncoder = new ModelEncoder(
    [
        "hand",
        "trickNumber",
        "currentTrick",
        "playingLast",
        "ledSuit",
        "_brokenTrumpCards",
    ]
).encoder;
