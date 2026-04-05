declare module "@blex41/word-search" {
  export type WordSearchPathPoint = {
    x: number;
    y: number;
  };

  export type WordSearchPlacedWord = {
    word: string;
    clean?: string;
    path: WordSearchPathPoint[];
  };

  export type WordSearchOptions = {
    rows: number;
    cols: number;
    dictionary: string[];
    maxWords?: number;
    disabledDirections?: string[];
    backwardsProbability?: number;
    upperCase?: boolean;
    diacritics?: boolean;
  };

  export default class WordSearch {
    constructor(options: WordSearchOptions);

    grid: string[][];
    words: WordSearchPlacedWord[];
  }
}