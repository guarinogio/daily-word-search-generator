export function buildWordsPrompt(input: {
  topic?: string;
  language: string;
  wordsCount: number;
  requestedWordsCount: number;
}): string {
  const { topic, language, wordsCount, requestedWordsCount } = input;

  if (topic && topic.trim().length > 0) {
    return [
      "Return ONLY valid JSON.",
      `Generate exactly ${requestedWordsCount} unique words in ${language} related to this topic: "${topic}".`,
      "",
      "Exact JSON format:",
      "{",
      '  "topic": "final topic used",',
      '  "words": ["word1", "word2", "word3"]',
      "}",
      "",
      "Rules:",
      `- Return exactly ${requestedWordsCount} words.`,
      `- At least ${wordsCount} of them must remain unique even after removing accents, spaces, punctuation, and case differences.`,
      "- All words must be clearly related to the topic.",
      "- No repeated words.",
      "- Avoid variants that normalize to the same value.",
      "- Prefer nouns or short terms.",
      "- Avoid long phrases.",
      "- Compound words are allowed if natural.",
      "- Do not include any text outside the JSON."
    ].join("\n");
  }

  return [
    "Return ONLY valid JSON.",
    `Choose a random topic and generate exactly ${requestedWordsCount} unique words in ${language} related to that topic.`,
    "",
    "Exact JSON format:",
    "{",
    '  "topic": "chosen topic",',
    '  "words": ["word1", "word2", "word3"]',
    "}",
    "",
    "Rules:",
    `- Return exactly ${requestedWordsCount} words.`,
    `- At least ${wordsCount} of them must remain unique even after removing accents, spaces, punctuation, and case differences.`,
    "- All words must be clearly related to the topic.",
    "- No repeated words.",
    "- Avoid variants that normalize to the same value.",
    "- Prefer nouns or short terms.",
    "- Avoid long phrases.",
    "- Compound words are allowed if natural.",
    "- Do not include any text outside the JSON."
  ].join("\n");
}
