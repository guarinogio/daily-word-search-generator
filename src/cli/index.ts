import { env } from "../config/env.js";
import { paths } from "../config/paths.js";
import { ensureDirectoryExists } from "../utils/fs.js";
import { logInfo, logSuccess } from "../utils/logger.js";

function main(): void {
  ensureDirectoryExists(paths.outputDir);

  logInfo(`Model: ${env.MODEL_NAME}`);
  logInfo(`Language: ${env.LANGUAGE}`);
  logInfo(`Words count: ${env.WORDS_COUNT}`);
  logInfo(`Puzzle count: ${env.PUZZLE_COUNT}`);
  logInfo(`Words per puzzle: ${env.WORDS_PER_PUZZLE}`);
  logInfo(`Grid size: ${env.GRID_SIZE}`);
  logInfo(`Output directory: ${paths.outputDir}`);

  logSuccess("Configuration loaded successfully");
}

main();