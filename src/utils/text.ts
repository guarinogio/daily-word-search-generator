export function toTitleCase(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\b\p{L}/gu, (char) => char.toUpperCase());
}
