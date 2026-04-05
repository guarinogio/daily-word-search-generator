import path from "node:path";
import { env } from "./env.js";

const projectRoot = process.cwd();
const outputDir = path.resolve(projectRoot, env.OUTPUT_DIR);

export const paths = {
  projectRoot,
  outputDir,
  rawApiResponseJson: path.join(outputDir, "raw-api-response.json"),
  dailyWordsJson: path.join(outputDir, "daily-words.json"),
  dailyWordsTs: path.join(outputDir, "daily-words.ts"),
  dailyPuzzlesJson: path.join(outputDir, "daily-puzzles.json"),
  dailyPuzzlesTs: path.join(outputDir, "daily-puzzles.ts")
} as const;

export type Paths = typeof paths;
