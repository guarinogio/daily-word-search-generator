import WordSearch from "@blex41/word-search";
import type { DailyWord } from "../types/words.js";
import type { Cell, Direction, Placement } from "../types/puzzles.js";

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

  const normalizedValue = entry.clean ?? entry.word;
  const matchingWord = words.find((word) => word.value === normalizedValue);

  if (!matchingWord) {
    throw new Error(`Could not match placed word "${normalizedValue}" to source words`);
  }

  return {
    label: matchingWord.label,
    value: matchingWord.value,
    word: entry.word,
    clean: normalizedValue,
    start,
    end,
    direction,
    path
  };
}

export function generateWordSearchPuzzle(input: {
  words: DailyWord[];
  size: number;
}): {
  size: number;
  grid: string[][];
  placements: Placement[];
} {
  const dictionary = input.words.map((word) => word.value);

  const instance = new WordSearch({
    rows: input.size,
    cols: input.size,
    dictionary,
    maxWords: input.words.length,
    disabledDirections: [],
    backwardsProbability: 0.3,
    upperCase: true,
    diacritics: false
  });

  if (!Array.isArray(instance.grid) || instance.grid.length === 0) {
    throw new Error("Word search generator returned an empty grid");
  }

  if (!Array.isArray(instance.words) || instance.words.length !== input.words.length) {
    throw new Error(
      `Expected ${input.words.length} placed words but got ${instance.words?.length ?? 0}`
    );
  }

  const placements = instance.words.map((entry) => buildPlacement(entry, input.words));

  return {
    size: instance.grid.length,
    grid: instance.grid,
    placements
  };
}