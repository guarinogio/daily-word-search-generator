import { env } from "../config/env.js";

export type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
    index?: number;
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

export async function generateText(prompt: string): Promise<{
  rawResponseText: string;
  modelText: string;
}> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.MODEL_NAME}:generateContent`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-goog-api-key": env.GEMINI_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  const rawResponseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Gemini request failed with status ${response.status}: ${rawResponseText}`
    );
  }

  let data: GeminiGenerateResponse;

  try {
    data = JSON.parse(rawResponseText) as GeminiGenerateResponse;
  } catch {
    throw new Error("Gemini API response was not valid JSON");
  }

  if (data.error) {
    throw new Error(
      `Gemini API error: ${data.error.message ?? "Unknown error"}`
    );
  }

  const modelText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!modelText || modelText.trim().length === 0) {
    throw new Error("Gemini API returned an empty model text");
  }

  return {
    rawResponseText,
    modelText
  };
}