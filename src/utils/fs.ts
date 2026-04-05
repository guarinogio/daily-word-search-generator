import fs from "node:fs";
import path from "node:path";

export function ensureDirectoryExists(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function ensureParentDirectoryExists(filePath: string): void {
  const parentDir = path.dirname(filePath);
  ensureDirectoryExists(parentDir);
}
