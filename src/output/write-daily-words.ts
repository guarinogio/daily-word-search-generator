import fs from "node:fs";
import path from "node:path";
import { paths } from "../config/paths.js";
import type { DailyWordsData } from "../types/words.js";
import { ensureParentDirectoryExists } from "../utils/fs.js";

function buildDatedPath(originalPath: string, date: string): string {
  const dir = path.dirname(originalPath);
  const ext = path.extname(originalPath);
  const base = path.basename(originalPath, ext);

  return path.join(dir, `${base}-${date}${ext}`);
}

export function writeRawApiResponse(rawApiResponseText: string): void {
  ensureParentDirectoryExists(paths.rawApiResponseJson);

  fs.writeFileSync(paths.rawApiResponseJson, rawApiResponseText, "utf-8");
}

export function writeDailyWordsJson(dailyWords: DailyWordsData): void {
  ensureParentDirectoryExists(paths.dailyWordsJson);

  const content = `${JSON.stringify(dailyWords, null, 2)}\n`;

  // latest
  fs.writeFileSync(paths.dailyWordsJson, content, "utf-8");

  // historical
  const datedPath = buildDatedPath(paths.dailyWordsJson, dailyWords.date);
  fs.writeFileSync(datedPath, content, "utf-8");
}

export function writeDailyWordsTs(dailyWords: DailyWordsData): void {
  ensureParentDirectoryExists(paths.dailyWordsTs);

  const fileContent = `export type DailyWord = {
  label: string;
  value: string;
};

export type DailyWordsData = {
  id: string;
  date: string;
  topic: string;
  hash: string;
  words: DailyWord[];
};

export const dailyWords: DailyWordsData = ${JSON.stringify(dailyWords, null, 2)} as const;

export default dailyWords;
`;

  // latest
  fs.writeFileSync(paths.dailyWordsTs, fileContent, "utf-8");

  // historical
  const datedPath = buildDatedPath(paths.dailyWordsTs, dailyWords.date);
  fs.writeFileSync(datedPath, fileContent, "utf-8");
}
