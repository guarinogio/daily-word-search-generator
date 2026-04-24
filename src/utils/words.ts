export function normalizeWordLabel(input: string): string {
  return input.trim().normalize("NFC").replace(/\s+/g, " ");
}
