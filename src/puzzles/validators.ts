import type { DailyPuzzle, Placement } from "../types/puzzles.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function toCells(input: string): string[] {
  return Array.from(input.normalize("NFC"));
}

function readWordFromPath(grid: string[][], placement: Placement): string {
  return placement.path.map((cell) => grid[cell.row]?.[cell.col] ?? "").join("");
}

function validatePlacementBounds(
  placement: Placement,
  size: number,
  puzzleId: number
): void {
  for (const cell of placement.path) {
    assert(
      cell.row >= 0 && cell.row < size && cell.col >= 0 && cell.col < size,
      `Puzzle ${puzzleId}: placement "${placement.value}" has out-of-bounds cell (${cell.row}, ${cell.col})`
    );
  }
}

function validatePlacementEndpoints(placement: Placement, puzzleId: number): void {
  const first = placement.path[0];
  const last = placement.path[placement.path.length - 1];

  assert(
    first.row === placement.start.row && first.col === placement.start.col,
    `Puzzle ${puzzleId}: placement "${placement.value}" start does not match path`
  );

  assert(
    last.row === placement.end.row && last.col === placement.end.col,
    `Puzzle ${puzzleId}: placement "${placement.value}" end does not match path`
  );
}

function validatePlacementWord(
  grid: string[][],
  placement: Placement,
  puzzleId: number
): void {
  const reconstructed = readWordFromPath(grid, placement).normalize("NFC");
  const expected = placement.value.normalize("NFC");

  assert(
    reconstructed === expected,
    `Puzzle ${puzzleId}: placement "${placement.value}" does not match grid path, got "${reconstructed}"`
  );
}

export function validateDailyPuzzle(puzzle: DailyPuzzle): void {
  const size = puzzle.size;

  assert(Array.isArray(puzzle.grid), `Puzzle ${puzzle.id}: grid must be an array`);
  assert(
    puzzle.grid.length === size,
    `Puzzle ${puzzle.id}: grid row count does not match size`
  );

  for (const row of puzzle.grid) {
    assert(Array.isArray(row), `Puzzle ${puzzle.id}: grid row is not an array`);
    assert(row.length === size, `Puzzle ${puzzle.id}: grid is not square`);

    for (const cell of row) {
      assert(
        toCells(cell).length === 1,
        `Puzzle ${puzzle.id}: grid cell "${cell}" is not exactly one visible character`
      );
    }
  }

  assert(
    puzzle.words.length === puzzle.placements.length,
    `Puzzle ${puzzle.id}: words count and placements count do not match`
  );

  for (const placement of puzzle.placements) {
    assert(
      placement.value === placement.value.normalize("NFC"),
      `Puzzle ${puzzle.id}: placement "${placement.value}" is not NFC-normalized`
    );

    assert(
      placement.path.length === toCells(placement.value).length,
      `Puzzle ${puzzle.id}: placement "${placement.value}" path length does not match visible word length`
    );

    validatePlacementBounds(placement, size, puzzle.id);
    validatePlacementEndpoints(placement, puzzle.id);
    validatePlacementWord(puzzle.grid, placement, puzzle.id);
  }
}
