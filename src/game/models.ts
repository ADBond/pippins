import { flawedSmallModelEncoder } from "./encode";

export const modelCatalogue = {
    saltcote_pippins: {
        folder: "saltcore_pippins",
        encoder: flawedSmallModelEncoder,
    },
}
export type modelName = keyof typeof modelCatalogue;
