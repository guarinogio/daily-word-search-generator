import fs from "node:fs";
import { paths } from "../config/paths.js";
import type { DailyPuzzlesData } from "../types/puzzles.js";
import { ensureParentDirectoryExists } from "../utils/fs.js";

export function writeDailyPuzzlesJson(dailyPuzzles: DailyPuzzlesData): void {
  ensureParentDirectoryExists(paths.dailyPuzzlesJson);

  fs.writeFileSync(
    paths.dailyPuzzlesJson,
    `${JSON.stringify(dailyPuzzles, null, 2)}\n`,
    "utf-8"
  );
}

export function writeDailyPuzzlesTs(dailyPuzzles: DailyPuzzlesData): void {
  ensureParentDirectoryExists(paths.dailyPuzzlesTs);

  const fileContent = `export type DailyWord = {
  label: string;
  value: string;
};

export type Cell = {
  row: number;
  col: number;
};

export type Direction = "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW";

export type Placement = {
  label: string;
  value: string;
  word: string;
  clean: string;
  start: Cell;
  end: Cell;
  direction: Direction;
  path: Cell[];
};

export type DailyPuzzle = {
  id: number;
  size: number;
  topic: string;
  words: DailyWord[];
  grid: string[][];
  placements: Placement[];
};

export type DailyPuzzlesData = {
  id: string;
  date: string;
  topic: string;
  hash: string;
  puzzles: DailyPuzzle[];
};

export const dailyPuzzles: DailyPuzzlesData = ${JSON.stringify(dailyPuzzles, null, 2)} as const;

export default dailyPuzzles;
`;

  fs.writeFileSync(paths.dailyPuzzlesTs, fileContent, "utf-8");
}