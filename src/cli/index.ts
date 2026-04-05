import { Command } from "commander";
import { generateDailyWords } from "../ai/generate-words.js";
import { env } from "../config/env.js";
import { paths } from "../config/paths.js";
import {
    writeDailyWordsJson,
    writeDailyWordsTs,
    writeRawApiResponse
} from "../output/write-daily-words.js";
import { ensureDirectoryExists } from "../utils/fs.js";
import { logError, logInfo, logSuccess } from "../utils/logger.js";

const program = new Command();

program
    .name("daily-word-search-generator")
    .description("Generate daily themed words for word-search puzzles")
    .option("-t, --topic <topic>", "Use a specific topic instead of a random one");

program.parse(process.argv);

const options = program.opts<{ topic?: string }>();

async function main(): Promise<void> {
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
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    logError(message);
    process.exit(1);
});