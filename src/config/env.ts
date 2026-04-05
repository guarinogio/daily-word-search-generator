import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  MODEL_NAME: z.string().min(1).default("gemini-2.5-flash"),
  LANGUAGE: z.string().min(2).default("es"),
  OUTPUT_DIR: z.string().min(1).default("./generated"),
  WORDS_COUNT: z.coerce.number().int().positive().default(50),
  PUZZLE_COUNT: z.coerce.number().int().positive().default(5),
  WORDS_PER_PUZZLE: z.coerce.number().int().positive().default(10),
  GRID_SIZE: z.coerce.number().int().min(8).max(40).default(14)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:");
  console.error(JSON.stringify(parsedEnv.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

const config = parsedEnv.data;

if (config.PUZZLE_COUNT * config.WORDS_PER_PUZZLE !== config.WORDS_COUNT) {
  console.error(
    "Invalid numeric configuration: PUZZLE_COUNT * WORDS_PER_PUZZLE must equal WORDS_COUNT"
  );
  process.exit(1);
}

export const env = config;
export type Env = typeof env;