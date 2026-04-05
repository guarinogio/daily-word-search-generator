import crypto from "node:crypto";

export function createContentHash(value: unknown): string {
  const serialized = JSON.stringify(value);
  return crypto.createHash("sha256").update(serialized).digest("hex");
}