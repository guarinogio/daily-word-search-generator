import fs from "node:fs";
import { env } from "../config/env.js";
import { paths } from "../config/paths.js";
import type { DailyPuzzlesData, DailyPuzzle } from "../types/puzzles.js";
import type { DailyWordsData } from "../types/words.js";
import { createContentHash } from "../utils/hash.js";
import { chunkArray } from "../utils/chunk.js";
import { generateWordSearchPuzzle } from "./word-search-generator.js";
import { validateDailyPuzzle } from "./validators.js";

export function buildDailyPuzzles(): DailyPuzzlesData {
  if (!fs.existsSync(paths.dailyWordsJson)) {
    throw new Error(
      `Missing input file: ${paths.dailyWordsJson}. Run the words generation step first.`
    );
  }

  const fileContent = fs.readFileSync(paths.dailyWordsJson, "utf-8");
  const dailyWords = JSON.parse(fileContent) as DailyWordsData;

  if (!Array.isArray(dailyWords.words) || dailyWords.words.length !== env.WORDS_COUNT) {
    throw new Error(
      `Expected ${env.WORDS_COUNT} words in ${paths.dailyWordsJson}, got ${dailyWords.words?.length ?? 0}`
    );
  }

  const wordGroups = chunkArray(dailyWords.words, env.WORDS_PER_PUZZLE);

  if (wordGroups.length !== env.PUZZLE_COUNT) {
    throw new Error(
      `Expected ${env.PUZZLE_COUNT} word groups but got ${wordGroups.length}`
    );
  }

  const puzzles: DailyPuzzle[] = wordGroups.map((group, index) => {
    const generatedPuzzle = generateWordSearchPuzzle({
      words: group,
      size: env.GRID_SIZE
    });

    const puzzle: DailyPuzzle = {
      id: index + 1,
      size: generatedPuzzle.size,
      topic: dailyWords.topic,
      words: group,
      grid: generatedPuzzle.grid,
      placements: generatedPuzzle.placements
    };

    validateDailyPuzzle(puzzle);

    return puzzle;
  });

  const hash = createContentHash({
    id: dailyWords.id,
    date: dailyWords.date,
    topic: dailyWords.topic,
    puzzles
  });

  return {
    id: dailyWords.id,
    date: dailyWords.date,
    topic: dailyWords.topic,
    hash,
    puzzles
  };
}
