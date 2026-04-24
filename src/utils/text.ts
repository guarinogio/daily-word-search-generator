export function toTitleCase(input: string): string {
  return input
    .trim()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .replace(/\p{L}[\p{L}\p{N}'’_-]*/gu, (word) => {
      const [first = "", ...rest] = Array.from(word);
      return `${first.toLocaleUpperCase("en-US")}${rest.join("").toLocaleLowerCase("en-US")}`;
    });
}
