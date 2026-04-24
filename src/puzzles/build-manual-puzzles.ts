import fs from "node:fs";
import path from "node:path";
import { env } from "../config/env.js";
import type { DailyPuzzlesData, DailyPuzzle } from "../types/puzzles.js";
import type { DailyWord } from "../types/words.js";
import { createContentHash } from "../utils/hash.js";
import { normalizeWordValue } from "../utils/normalize.js";
import { toTitleCase } from "../utils/text.js";
import { normalizeWordLabel } from "../utils/words.js";
import { generateWordSearchPuzzle } from "./word-search-generator.js";
import { validateDailyPuzzle } from "./validators.js";

type ManualPuzzleInput = {
  title: string;
  words: string[];
};

type ManualPuzzlesFile = {
  date?: string;
  puzzles: ManualPuzzleInput[];
};

function normalizeManualWords(words: string[]): DailyWord[] {
  const seen = new Set<string>();

  return words
    .map((word) => {
      const label = normalizeWordLabel(word);
      const value = normalizeWordValue(word);

      return { label, value };
    })
    .filter((word) => {
      if (word.value.length < env.MIN_WORD_LENGTH) {
        return false;
      }

      if (seen.has(word.value)) {
        return false;
      }

      seen.add(word.value);
      return true;
    });
}

export function buildManualDailyPuzzles(inputPath: string): DailyPuzzlesData {
  const resolvedPath = path.resolve(process.cwd(), inputPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Manual puzzles file not found: ${resolvedPath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(resolvedPath, "utf-8")) as ManualPuzzlesFile;

  if (!Array.isArray(parsed.puzzles)) {
    throw new Error(`Manual puzzles file must contain a "puzzles" array`);
  }

  if (parsed.puzzles.length !== env.PUZZLE_COUNT) {
    throw new Error(
      `Expected ${env.PUZZLE_COUNT} puzzles but got ${parsed.puzzles.length}`
    );
  }

  const date =
    parsed.date ??
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());

  const puzzles: DailyPuzzle[] = parsed.puzzles.map((manualPuzzle, index) => {
    if (
      typeof manualPuzzle.title !== "string" ||
      manualPuzzle.title.trim().length === 0
    ) {
      throw new Error(`Puzzle ${index + 1}: title is required`);
    }

    if (!Array.isArray(manualPuzzle.words)) {
      throw new Error(`Puzzle ${index + 1}: words must be an array`);
    }

    const words = normalizeManualWords(manualPuzzle.words);

    if (words.length !== env.WORDS_PER_PUZZLE) {
      throw new Error(
        `Puzzle ${index + 1} "${manualPuzzle.title}" expected ${
          env.WORDS_PER_PUZZLE
        } valid unique words but got ${words.length}`
      );
    }

    const generatedPuzzle = generateWordSearchPuzzle({
      words,
      rows: env.GRID_ROWS,
      cols: env.GRID_COLS
    });

    const puzzle: DailyPuzzle = {
      id: index + 1,
      size: generatedPuzzle.size,
      rows: generatedPuzzle.rows,
      cols: generatedPuzzle.cols,
      topic: toTitleCase(manualPuzzle.title),
      words,
      grid: generatedPuzzle.grid,
      placements: generatedPuzzle.placements
    };

    validateDailyPuzzle(puzzle);

    return puzzle;
  });

  const hash = createContentHash({
    id: date,
    date,
    topic: "Manual",
    puzzles
  });

  return {
    id: date,
    date,
    topic: "Manual",
    hash,
    puzzles
  };
}
