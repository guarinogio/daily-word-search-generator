export function logInfo(message: string): void {
  console.log(`[info] ${message}`);
}

export function logWarn(message: string): void {
  console.warn(`[warn] ${message}`);
}

export function logError(message: string): void {
  console.error(`[error] ${message}`);
}

export function logSuccess(message: string): void {
  console.log(`[success] ${message}`);
}
