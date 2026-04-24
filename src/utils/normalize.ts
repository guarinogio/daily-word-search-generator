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

export function removeLatinDiacritics(input: string): string {
  return input.normalize("NFD").replace(/\p{Diacritic}/gu, "").normalize("NFC");
}

function normalizeCase(input: string): string {
  return input.toLocaleUpperCase("en-US").normalize("NFC");
}

export function normalizeWordValue(input: string): string {
  const trimmed = input.trim().normalize("NFC");
  const onlyLettersAndNumbers = trimmed.replace(/[^\p{L}\p{N} ]+/gu, "");
  const compact = onlyLettersAndNumbers.replace(/\s+/g, "");

  return normalizeCase(removeLatinDiacritics(compact));
}
