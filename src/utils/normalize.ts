export function stripMarkdownCodeFence(input: string): string {
  const trimmed = input.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  const lines = trimmed.split("\n");

  if (lines.length >= 3) {
    return lines.slice(1, -1).join("\n").trim();
  }

  return trimmed;
}

export function removeDiacritics(input: string): string {
  return input.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function normalizeWordValue(input: string): string {
  const noDiacritics = removeDiacritics(input.trim());
  const upper = noDiacritics.toLocaleUpperCase();
  const onlyAllowed = upper.replace(/[^\p{L}\p{N} ]+/gu, "");
  const noSpaces = onlyAllowed.replace(/\s+/g, "");

  return noSpaces;
}
