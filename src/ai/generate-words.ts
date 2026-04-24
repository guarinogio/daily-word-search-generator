import { env } from "../config/env.js";
import type { DailyWord, DailyWordsData } from "../types/words.js";
import { createContentHash } from "../utils/hash.js";
import { stripMarkdownCodeFence, normalizeWordValue } from "../utils/normalize.js";
import { toTitleCase } from "../utils/text.js";
import { normalizeWordLabel } from "../utils/words.js";
import { buildWordsPrompt } from "./prompts.js";
import { generateText } from "./gemini.js";

type RawWordsPayload = {
  topic?: unknown;
  words?: unknown;
};

type GenerateDailyWordsInput = {
  topic?: string;
  wordsCount?: number;
  requestedWordsCount?: number;
};

function normalizeWords(rawWords: unknown[]): DailyWord[] {
  const seen = new Set<string>();
  const normalizedWords: DailyWord[] = [];

  for (const item of rawWords) {
    const rawLabel = String(item ?? "").trim();

    if (rawLabel.length === 0) {
      continue;
    }

    const value = normalizeWordValue(rawLabel);

    if (value.length < env.MIN_WORD_LENGTH) {
      continue;
    }

    if (seen.has(value)) {
      continue;
    }

    seen.add(value);

    normalizedWords.push({
      label: normalizeWordLabel(rawLabel),
      value
    });
  }

  return normalizedWords;
}

async function generateOnce(input: {
  topic?: string;
  wordsCount: number;
  requestedWordsCount: number;
}): Promise<{
  topic: string;
  normalizedWords: DailyWord[];
  rawApiResponseText: string;
}> {
  const prompt = buildWordsPrompt({
    topic: input.topic,
    language: env.LANGUAGE,
    wordsCount: input.wordsCount,
    requestedWordsCount: input.requestedWordsCount
  });

  const { rawResponseText, modelText } = await generateText(prompt);
  const cleanedModelText = stripMarkdownCodeFence(modelText);

  let parsedPayload: RawWordsPayload;

  try {
    parsedPayload = JSON.parse(cleanedModelText) as RawWordsPayload;
  } catch {
    throw new Error("Model output was not valid JSON");
  }

  if (
    typeof parsedPayload.topic !== "string" ||
    parsedPayload.topic.trim().length === 0
  ) {
    throw new Error("Model output is missing a valid topic");
  }

  if (!Array.isArray(parsedPayload.words)) {
    throw new Error("Model output is missing a valid words array");
  }

  if (parsedPayload.words.length !== input.requestedWordsCount) {
    throw new Error(
      `Expected ${input.requestedWordsCount} requested words but received ${parsedPayload.words.length}`
    );
  }

  const normalizedWords = normalizeWords(parsedPayload.words);

  return {
    topic: toTitleCase(parsedPayload.topic.trim()),
    normalizedWords,
    rawApiResponseText: rawResponseText
  };
}

export async function generateDailyWords(input: GenerateDailyWordsInput): Promise<{
  dailyWords: DailyWordsData;
  rawApiResponseText: string;
}> {
  const wordsCount = input.wordsCount ?? env.WORDS_COUNT;
  const requestedWordsCount = input.requestedWordsCount ?? env.WORDS_REQUEST_COUNT;

  let lastErrorMessage = "Unknown error";

  for (let attempt = 1; attempt <= env.MAX_GENERATION_ATTEMPTS; attempt += 1) {
    try {
      const result = await generateOnce({
        topic: input.topic,
        wordsCount,
        requestedWordsCount
      });

      if (result.normalizedWords.length < wordsCount) {
        lastErrorMessage =
          `Attempt ${attempt}: expected at least ${wordsCount} unique valid words after normalization, ` +
          `but got ${result.normalizedWords.length}`;
        continue;
      }

      const date = new Date().toISOString().slice(0, 10);
      const words = result.normalizedWords.slice(0, wordsCount);

      const hash = createContentHash({
        date,
        topic: result.topic,
        words
      });

      const dailyWords: DailyWordsData = {
        id: date,
        date,
        topic: result.topic,
        hash,
        words
      };

      return {
        dailyWords,
        rawApiResponseText: result.rawApiResponseText
      };
    } catch (error: unknown) {
      lastErrorMessage = error instanceof Error ? error.message : String(error);
    }
  }

  throw new Error(
    `Failed to generate valid daily words after ${env.MAX_GENERATION_ATTEMPTS} attempts. Last error: ${lastErrorMessage}`
  );
}
