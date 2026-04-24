import WordSearch from "@blex41/word-search";
import type { DailyWord } from "../types/words.js";
import type { Cell, Direction, Placement } from "../types/puzzles.js";

const MAX_GENERATION_ATTEMPTS = 100;

const KOREAN_FILLER_CHARS = Array.from(
  "가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호구누두루무부수우주추쿠투푸후기니디리미비시이지치키티피히"
);

const LATIN_FILLER_CHARS = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

function randomItem<T>(items: T[]): T {
  const item = items[Math.floor(Math.random() * items.length)];

  if (item === undefined) {
    throw new Error("Cannot pick a random item from an empty array");
  }

  return item;
}

function isHangulSyllable(char: string): boolean {
  return /^\p{Script=Hangul}$/u.test(char);
}

function shouldUseKoreanFiller(words: DailyWord[]): boolean {
  return words.every((word) =>
    Array.from(word.value.normalize("NFC")).every((char) => isHangulSyllable(char))
  );
}

function buildPlacedCellSet(placements: Placement[]): Set<string> {
  const placedCells = new Set<string>();

  for (const placement of placements) {
    for (const cell of placement.path) {
      placedCells.add(`${cell.row},${cell.col}`);
    }
  }

  return placedCells;
}

function replaceUnplacedCellsWithFiller(input: {
  grid: string[][];
  placements: Placement[];
  fillerChars: string[];
}): string[][] {
  const placedCells = buildPlacedCellSet(input.placements);

  return input.grid.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      if (placedCells.has(`${rowIndex},${colIndex}`)) {
        return cell.normalize("NFC");
      }

      return randomItem(input.fillerChars);
    })
  );
}

function getDirection(start: Cell, end: Cell): Direction {
  const deltaCol = Math.sign(end.col - start.col);
  const deltaRow = Math.sign(end.row - start.row);

  const directionMap: Record<string, Direction> = {
    "1,0": "E",
    "-1,0": "W",
    "0,1": "S",
    "0,-1": "N",
    "1,1": "SE",
    "1,-1": "NE",
    "-1,1": "SW",
    "-1,-1": "NW"
  };

  const direction = directionMap[`${deltaCol},${deltaRow}`];

  if (!direction) {
    throw new Error(
      `Invalid placement direction from (${start.row}, ${start.col}) to (${end.row}, ${end.col})`
    );
  }

  return direction;
}

function mapPathToCells(path: Array<{ x: number; y: number }>): Cell[] {
  return path.map((point) => ({
    row: point.y,
    col: point.x
  }));
}

function buildPlacement(
  entry: { word: string; clean?: string; path: Array<{ x: number; y: number }> },
  words: DailyWord[]
): Placement {
  const path = mapPathToCells(entry.path);

  if (path.length === 0) {
    throw new Error("Encountered a placed word with an empty path");
  }

  const start = path[0];
  const end = path[path.length - 1];
  const direction = getDirection(start, end);

  const normalizedValue = (entry.clean ?? entry.word).normalize("NFC");
  const matchingWord = words.find((word) => word.value.normalize("NFC") === normalizedValue);

  if (!matchingWord) {
    throw new Error(`Could not match placed word "${normalizedValue}" to source words`);
  }

  return {
    label: matchingWord.label,
    value: matchingWord.value.normalize("NFC"),
    word: entry.word.normalize("NFC"),
    clean: normalizedValue,
    start,
    end,
    direction,
    path
  };
}

function createInstance(input: { words: DailyWord[]; size: number }): WordSearch {
  const dictionary = input.words.map((word) => word.value.normalize("NFC"));

  return new WordSearch({
    rows: input.size,
    cols: input.size,
    dictionary,
    maxWords: input.words.length,
    disabledDirections: [],
    backwardsProbability: 0.3,
    upperCase: true,
    diacritics: false
  });
}

export function generateWordSearchPuzzle(input: { words: DailyWord[]; size: number }): {
  size: number;
  grid: string[][];
  placements: Placement[];
} {
  let lastPlacedCount = 0;

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const instance = createInstance(input);

    if (!Array.isArray(instance.grid) || instance.grid.length === 0) {
      continue;
    }

    if (!Array.isArray(instance.words)) {
      continue;
    }

    lastPlacedCount = Math.max(lastPlacedCount, instance.words.length);

    if (instance.words.length !== input.words.length) {
      continue;
    }

    const placements = instance.words.map((entry) => buildPlacement(entry, input.words));

    const normalizedGrid = instance.grid.map((row) =>
      row.map((cell) => cell.normalize("NFC"))
    );

    return {
      size: instance.grid.length,
      grid: replaceUnplacedCellsWithFiller({
        grid: normalizedGrid,
        placements,
        fillerChars: shouldUseKoreanFiller(input.words)
          ? KOREAN_FILLER_CHARS
          : LATIN_FILLER_CHARS
      }),
      placements
    };
  }

  throw new Error(
    `Failed to place all words after ${MAX_GENERATION_ATTEMPTS} attempts. Expected ${input.words.length}, best attempt placed ${lastPlacedCount}.`
  );
}
