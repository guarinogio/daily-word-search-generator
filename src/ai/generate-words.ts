import { env } from "../config/env.js";
import type { DailyWord, DailyWordsData } from "../types/words.js";
import { createContentHash } from "../utils/hash.js";
import { stripMarkdownCodeFence, normalizeWordValue } from "../utils/normalize.js";
import { toTitleCase } from "../utils/text.js";
import { buildWordsPrompt } from "./prompts.js";
import { generateText } from "./gemini.js";

type RawWordsPayload = {
  topic?: unknown;
  words?: unknown;
};

function normalizeWords(rawWords: unknown[]): DailyWord[] {
  const seen = new Set<string>();
  const normalizedWords: DailyWord[] = [];

  for (const item of rawWords) {
    const label = String(item ?? "").trim();

    if (label.length === 0) {
      continue;
    }

    const value = normalizeWordValue(label);

    if (value.length < 3) {
      continue;
    }

    if (seen.has(value)) {
      continue;
    }

    seen.add(value);
    normalizedWords.push({
      label,
      value
    });
  }

  return normalizedWords;
}

async function generateOnce(input: {
  topic?: string;
}): Promise<{
  topic: string;
  normalizedWords: DailyWord[];
  rawApiResponseText: string;
}> {
  const prompt = buildWordsPrompt({
    topic: input.topic,
    language: env.LANGUAGE,
    wordsCount: env.WORDS_COUNT,
    requestedWordsCount: env.WORDS_REQUEST_COUNT
  });

  const { rawResponseText, modelText } = await generateText(prompt);
  const cleanedModelText = stripMarkdownCodeFence(modelText);

  let parsedPayload: RawWordsPayload;

  try {
    parsedPayload = JSON.parse(cleanedModelText) as RawWordsPayload;
  } catch {
    throw new Error("Model output was not valid JSON");
  }

  if (typeof parsedPayload.topic !== "string" || parsedPayload.topic.trim().length === 0) {
    throw new Error("Model output is missing a valid topic");
  }

  if (!Array.isArray(parsedPayload.words)) {
    throw new Error("Model output is missing a valid words array");
  }

  if (parsedPayload.words.length !== env.WORDS_REQUEST_COUNT) {
    throw new Error(
      `Expected ${env.WORDS_REQUEST_COUNT} requested words but received ${parsedPayload.words.length}`
    );
  }

  const normalizedWords = normalizeWords(parsedPayload.words);

  return {
    topic: toTitleCase(parsedPayload.topic.trim()),
    normalizedWords,
    rawApiResponseText: rawResponseText
  };
}

export async function generateDailyWords(input: {
  topic?: string;
}): Promise<{
  dailyWords: DailyWordsData;
  rawApiResponseText: string;
}> {
  let lastErrorMessage = "Unknown error";

  for (let attempt = 1; attempt <= env.MAX_GENERATION_ATTEMPTS; attempt += 1) {
    try {
      const result = await generateOnce(input);

      if (result.normalizedWords.length < env.WORDS_COUNT) {
        lastErrorMessage =
          `Attempt ${attempt}: expected at least ${env.WORDS_COUNT} unique valid words after normalization, ` +
          `but got ${result.normalizedWords.length}`;
        continue;
      }

      const date = new Date().toISOString().slice(0, 10);
      const words = result.normalizedWords.slice(0, env.WORDS_COUNT);

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