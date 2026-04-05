# daily-word-search-generator

A TypeScript CLI that generates daily themed word sets and word-search puzzle data for a frontend application.

## Overview

This project is designed to power a daily word-search game.

It can:

- generate a themed list of words using Google Gemini
- normalize and validate those words
- split them into multiple daily puzzles
- generate word-search grids and placement metadata
- export ready-to-consume `.json` and `.ts` files for a separate frontend project

## Features

- TypeScript-first CLI
- `.env`-based configuration
- strict configuration validation with `zod`
- word normalization for puzzle-safe values
- daily metadata with `id`, `date`, and `hash`
- validated puzzle output
- TypeScript and JSON output artifacts

## Output

The generator writes files into the configured output directory.

Default output files:

- generated/raw-api-response.json
- generated/daily-words.json
- generated/daily-words.ts
- generated/daily-puzzles.json
- generated/daily-puzzles.ts

## Project Structure

```
src/
  @types/
  ai/
  cli/
  config/
  output/
  puzzles/
  types/
  utils/
generated/
```

## Requirements

- Node.js 22+
- npm

## Installation

```bash
git clone <your-repo-url>
cd daily-word-search-generator
npm install
cp .env.example .env
```

Then edit `.env` and add your Gemini API key.

## Environment Variables

Example:

```dotenv
GEMINI_API_KEY=your_gemini_api_key_here
MODEL_NAME=gemini-2.5-flash
LANGUAGE=en_US
OUTPUT_DIR=./generated
WORDS_COUNT=50
WORDS_REQUEST_COUNT=65
PUZZLE_COUNT=5
WORDS_PER_PUZZLE=10
GRID_SIZE=14
MAX_GENERATION_ATTEMPTS=3
```

### Notes

- `PUZZLE_COUNT * WORDS_PER_PUZZLE` must equal `WORDS_COUNT`
- `WORDS_REQUEST_COUNT` should be greater than or equal to `WORDS_COUNT`
- `generated/` is ignored by git by default

## Commands

Generate words only:

```bash
npm run generate
npm run generate -- --topic "coffee shop"
```

Build puzzles from an existing `daily-words.json`:

```bash
npm run build:puzzles
```

Run the full pipeline:

```bash
npm run daily
npm run daily -- --topic "coffee shop"
```

Type-check the project:

```bash
npm run check
```

Format the code:

```bash
npm run format
```

## Data Model

### dailyWords

```ts
type DailyWordsData = {
  id: string;
  date: string;
  topic: string;
  hash: string;
  words: {
    label: string;
    value: string;
  }[];
};
```

- label is the display-friendly version
- value is the normalized puzzle-safe version

### dailyPuzzles

```ts
type DailyPuzzlesData = {
  id: string;
  date: string;
  topic: string;
  hash: string;
  puzzles: {
    id: number;
    size: number;
    topic: string;
    words: {
      label: string;
      value: string;
    }[];
    grid: string[][];
    placements: {
      label: string;
      value: string;
      word: string;
      clean: string;
      start: { row: number; col: number };
      end: { row: number; col: number };
      direction: "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW";
      path: { row: number; col: number }[];
    }[];
  }[];
};
```

## Intended Usage

This repository is intended to be used as a content generator for another project, such as:

- a React app
- a mobile-friendly daily game
- a word-search puzzle frontend

The frontend should import or consume the generated files and focus only on rendering and gameplay.

## Security

Do not commit your `.env` file.

Your Gemini API key should only exist in local or private deployment environments.

## Notes on Dependencies

This project currently uses @blex41/word-search to generate puzzle grids. The dependency is wrapped behind internal modules so it can be replaced later if needed.

## License

MIT
