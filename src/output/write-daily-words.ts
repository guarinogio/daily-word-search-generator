import fs from "node:fs";
import { paths } from "../config/paths.js";
import type { DailyWordsData } from "../types/words.js";
import { ensureParentDirectoryExists } from "../utils/fs.js";

export function writeRawApiResponse(rawApiResponseText: string): void {
  ensureParentDirectoryExists(paths.rawApiResponseJson);
  fs.writeFileSync(paths.rawApiResponseJson, rawApiResponseText, "utf-8");
}

export function writeDailyWordsJson(dailyWords: DailyWordsData): void {
  ensureParentDirectoryExists(paths.dailyWordsJson);
  fs.writeFileSync(
    paths.dailyWordsJson,
    `${JSON.stringify(dailyWords, null, 2)}\n`,
    "utf-8"
  );
}

export function writeDailyWordsTs(dailyWords: DailyWordsData): void {
  ensureParentDirectoryExists(paths.dailyWordsTs);

  const fileContent = `export type DailyWord = {
  label: string;
  value: string;
};

export type DailyWordsData = {
  date: string;
  topic: string;
  words: DailyWord[];
};

export const dailyWords: DailyWordsData = ${JSON.stringify(dailyWords, null, 2)} as const;

export default dailyWords;
`;

  fs.writeFileSync(paths.dailyWordsTs, fileContent, "utf-8");
}