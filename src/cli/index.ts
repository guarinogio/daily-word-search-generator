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
import { buildDailyPuzzles } from "../puzzles/build-puzzles.js";
import { ensureDirectoryExists } from "../utils/fs.js";
import { logError, logInfo, logSuccess } from "../utils/logger.js";

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

    logInfo(`Model: ${env.MODEL_NAME}`);
    logInfo(`Language: ${env.LANGUAGE}`);
    logInfo(`Words count: ${env.WORDS_COUNT}`);
    logInfo(`Requested words count: ${env.WORDS_REQUEST_COUNT}`);
    logInfo(`Max generation attempts: ${env.MAX_GENERATION_ATTEMPTS}`);
    logInfo(`Output directory: ${paths.outputDir}`);
    logInfo(`Topic mode: ${options.topic ? "manual" : "random"}`);

    const { dailyWords, rawApiResponseText } = await generateDailyWords({
      topic: options.topic
    });

    writeRawApiResponse(rawApiResponseText);
    writeDailyWordsJson(dailyWords);
    writeDailyWordsTs(dailyWords);

    logSuccess(`Topic: ${dailyWords.topic}`);
    logSuccess(`Words generated: ${dailyWords.words.length}`);
    logSuccess(`Wrote: ${paths.rawApiResponseJson}`);
    logSuccess(`Wrote: ${paths.dailyWordsJson}`);
    logSuccess(`Wrote: ${paths.dailyWordsTs}`);
  });

program
  .command("build-puzzles")
  .description("Build daily word-search puzzles from generated words")
  .action(() => {
    ensureDirectoryExists(paths.outputDir);

    logInfo(`Puzzle count: ${env.PUZZLE_COUNT}`);
    logInfo(`Words per puzzle: ${env.WORDS_PER_PUZZLE}`);
    logInfo(`Grid size: ${env.GRID_SIZE}`);
    logInfo(`Output directory: ${paths.outputDir}`);

    const dailyPuzzles = buildDailyPuzzles();

    writeDailyPuzzlesJson(dailyPuzzles);
    writeDailyPuzzlesTs(dailyPuzzles);

    logSuccess(`Topic: ${dailyPuzzles.topic}`);
    logSuccess(`Puzzles generated: ${dailyPuzzles.puzzles.length}`);
    logSuccess(`Wrote: ${paths.dailyPuzzlesJson}`);
    logSuccess(`Wrote: ${paths.dailyPuzzlesTs}`);
  });

program
  .command("daily")
  .description("Generate daily words and build puzzles in one command")
  .option("-t, --topic <topic>", "Use a specific topic instead of a random one")
  .action(async (options: { topic?: string }) => {
    ensureDirectoryExists(paths.outputDir);

    logInfo(`Model: ${env.MODEL_NAME}`);
    logInfo(`Language: ${env.LANGUAGE}`);
    logInfo(`Words count: ${env.WORDS_COUNT}`);
    logInfo(`Requested words count: ${env.WORDS_REQUEST_COUNT}`);
    logInfo(`Puzzle count: ${env.PUZZLE_COUNT}`);
    logInfo(`Words per puzzle: ${env.WORDS_PER_PUZZLE}`);
    logInfo(`Grid size: ${env.GRID_SIZE}`);
    logInfo(`Output directory: ${paths.outputDir}`);
    logInfo(`Topic mode: ${options.topic ? "manual" : "random"}`);

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
    logSuccess(`Wrote: ${paths.dailyWordsJson}`);
    logSuccess(`Wrote: ${paths.dailyWordsTs}`);
    logSuccess(`Wrote: ${paths.dailyPuzzlesJson}`);
    logSuccess(`Wrote: ${paths.dailyPuzzlesTs}`);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logError(message);
  process.exit(1);
});