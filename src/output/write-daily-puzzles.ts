import fs from "node:fs";
import path from "node:path";
import { env } from "../config/env.js";
import { paths } from "../config/paths.js";
import type { DailyPuzzlesData } from "../types/puzzles.js";
import { ensureDirectoryExists, ensureParentDirectoryExists } from "../utils/fs.js";

function buildDatedPath(originalPath: string, date: string): string {
  const dir = path.dirname(originalPath);
  const ext = path.extname(originalPath);
  const base = path.basename(originalPath, ext);

  return path.join(dir, `${base}-${date}${ext}`);
}

function buildDailyPuzzlesTsFileContent(dailyPuzzles: DailyPuzzlesData): string {
  return `export type DailyWord = {
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
}

export function writeDailyPuzzlesJson(dailyPuzzles: DailyPuzzlesData): void {
  ensureParentDirectoryExists(paths.dailyPuzzlesJson);

  const content = `${JSON.stringify(dailyPuzzles, null, 2)}\n`;

  fs.writeFileSync(paths.dailyPuzzlesJson, content, "utf-8");

  const datedPath = buildDatedPath(paths.dailyPuzzlesJson, dailyPuzzles.date);
  fs.writeFileSync(datedPath, content, "utf-8");
}

export function writeDailyPuzzlesTs(dailyPuzzles: DailyPuzzlesData): void {
  ensureParentDirectoryExists(paths.dailyPuzzlesTs);

  const fileContent = buildDailyPuzzlesTsFileContent(dailyPuzzles);

  fs.writeFileSync(paths.dailyPuzzlesTs, fileContent, "utf-8");

  const datedPath = buildDatedPath(paths.dailyPuzzlesTs, dailyPuzzles.date);
  fs.writeFileSync(datedPath, fileContent, "utf-8");

  if (env.LATEST_DATED_PUZZLES_TS_OUTPUT_DIR.trim().length > 0) {
    const extraOutputDir = path.resolve(
      process.cwd(),
      env.LATEST_DATED_PUZZLES_TS_OUTPUT_DIR
    );
    ensureDirectoryExists(extraOutputDir);

    const extraOutputPath = path.join(
      extraOutputDir,
      `daily-puzzles-${dailyPuzzles.date}.ts`
    );

    fs.writeFileSync(extraOutputPath, fileContent, "utf-8");
  }
}
