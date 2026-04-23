import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import { generateDailyWords } from "../ai/generate-words.js";
import { env } from "../config/env.js";
import { paths } from "../config/paths.js";
import {
  writeDailyWordsJson,
  writeDailyWordsTs,
  writeRawApiResponse
} from "../output/write-daily-words.js";
import {
  writeDailyPuzzlesJson,
  writeDailyPuzzlesTs
} from "../output/write-daily-puzzles.js";
import {
  buildDailyPuzzles,
  buildDailyPuzzlesFromWordSets
} from "../puzzles/build-puzzles.js";
import { ensureDirectoryExists } from "../utils/fs.js";
import { logError, logInfo, logSuccess } from "../utils/logger.js";

type TopicsFile = {
  topics?: unknown;
};

function readTopicsFile(filePath: string): string[] {
  const resolvedPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Topics file not found: ${resolvedPath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(resolvedPath, "utf-8")) as TopicsFile;

  if (!Array.isArray(parsed.topics)) {
    throw new Error(`Topics file must contain a "topics" array`);
  }

  const topics = parsed.topics
    .map((topic) => String(topic).trim())
    .filter((topic) => topic.length > 0);

  if (topics.length !== env.PUZZLE_COUNT) {
    throw new Error(`Expected ${env.PUZZLE_COUNT} topics but got ${topics.length}`);
  }

  return topics;
}

const program = new Command();

program
  .name("daily-word-search-generator")
  .description("Generate daily words and word-search puzzle data");

program
  .command("generate-words")
  .description("Generate daily themed words from Gemini")
  .option("-t, --topic <topic>", "Use a specific topic instead of a random one")
  .action(async (options: { topic?: string }) => {
    ensureDirectoryExists(paths.outputDir);

    const { dailyWords, rawApiResponseText } = await generateDailyWords({
      topic: options.topic
    });

    writeRawApiResponse(rawApiResponseText);
    writeDailyWordsJson(dailyWords);
    writeDailyWordsTs(dailyWords);

    logSuccess(`Topic: ${dailyWords.topic}`);
    logSuccess(`Words generated: ${dailyWords.words.length}`);
  });

program
  .command("build-puzzles")
  .description("Build daily word-search puzzles from generated words")
  .action(() => {
    ensureDirectoryExists(paths.outputDir);

    const dailyPuzzles = buildDailyPuzzles();

    writeDailyPuzzlesJson(dailyPuzzles);
    writeDailyPuzzlesTs(dailyPuzzles);

    logSuccess(`Topic: ${dailyPuzzles.topic}`);
    logSuccess(`Puzzles generated: ${dailyPuzzles.puzzles.length}`);
  });

program
  .command("daily")
  .description("Generate daily words and build puzzles in one command")
  .option("-t, --topic <topic>", "Use a specific topic instead of a random one")
  .action(async (options: { topic?: string }) => {
    ensureDirectoryExists(paths.outputDir);

    const { dailyWords, rawApiResponseText } = await generateDailyWords({
      topic: options.topic
    });

    writeRawApiResponse(rawApiResponseText);
    writeDailyWordsJson(dailyWords);
    writeDailyWordsTs(dailyWords);

    const dailyPuzzles = buildDailyPuzzles();

    writeDailyPuzzlesJson(dailyPuzzles);
    writeDailyPuzzlesTs(dailyPuzzles);

    logSuccess(`Topic: ${dailyWords.topic}`);
    logSuccess(`Words generated: ${dailyWords.words.length}`);
    logSuccess(`Puzzles generated: ${dailyPuzzles.puzzles.length}`);
  });

program
  .command("daily-multi")
  .description("Generate one puzzle per topic from a topics file")
  .option("--topics-file <path>", "Path to topics JSON file", "topics.json")
  .action(async (options: { topicsFile: string }) => {
    ensureDirectoryExists(paths.outputDir);

    const topics = readTopicsFile(options.topicsFile);

    logInfo(`Multi-topic mode`);
    logInfo(`Topics: ${topics.length}`);
    logInfo(`Words per puzzle: ${env.WORDS_PER_PUZZLE}`);
    logInfo(`Grid size: ${env.GRID_SIZE}`);

    const wordSets = [];
    const rawResponses = [];

    for (const topic of topics) {
      logInfo(`Generating words for topic: ${topic}`);

      const { dailyWords, rawApiResponseText } = await generateDailyWords({
        topic,
        wordsCount: env.WORDS_PER_PUZZLE,
        requestedWordsCount: env.WORDS_REQUEST_COUNT
      });

      wordSets.push(dailyWords);
      rawResponses.push({
        topic: dailyWords.topic,
        rawApiResponse: JSON.parse(rawApiResponseText)
      });
    }

    fs.writeFileSync(
      path.join(paths.outputDir, "raw-api-response-multi.json"),
      `${JSON.stringify(rawResponses, null, 2)}\n`,
      "utf-8"
    );

    const dailyPuzzles = buildDailyPuzzlesFromWordSets(wordSets);

    writeDailyPuzzlesJson(dailyPuzzles);
    writeDailyPuzzlesTs(dailyPuzzles);

    logSuccess(`Puzzles generated: ${dailyPuzzles.puzzles.length}`);
    logSuccess(`Wrote: ${paths.dailyPuzzlesJson}`);
    logSuccess(`Wrote: ${paths.dailyPuzzlesTs}`);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logError(message);
  process.exit(1);
});
