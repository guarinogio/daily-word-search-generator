# daily-word-search-generator

TypeScript CLI to generate daily word lists and word-search puzzle data for a React application.

## Overview

This project generates:
- A set of words from an AI model (Google Gemini)
- Multiple word-search puzzles
- TypeScript and JSON files ready to be consumed by a frontend (e.g. React)

## Features

- CLI-based workflow
- Configurable via .env
- Generates:
  - daily words
  - 5 puzzles per day (default)
- Outputs TypeScript files ready for import
- Mobile-friendly puzzle data design

## Tech Stack

- Node.js
- TypeScript
- tsx (runtime)
- dotenv
- zod
- commander

## Project Structure

```
src/
  cli/
  config/
  ai/
  puzzles/
  output/
  types/
  utils/
generated/
```

## Setup

```bash
npm install
cp .env.example .env
```

## Scripts

```bash
npm run dev
npm run check
npm run build
npm run lint
npm run format
```

## Usage (planned)

```bash
npm run generate
npm run generate -- --topic "kpop"
npm run build:puzzles
npm run daily
```

## Environment Variables

See `.env.example`

Key variables:

- GEMINI_API_KEY
- MODEL_NAME
- LANGUAGE
- OUTPUT_DIR
- WORDS_COUNT
- PUZZLE_COUNT
- WORDS_PER_PUZZLE
- GRID_SIZE

## Output

Generated files are stored in:

```
/generated
```

Typical outputs:

- daily-words.json
- daily-words.ts
- daily-puzzles.json
- daily-puzzles.ts

## Status

Bootstrap phase — core generation pipeline in progress.

## License

MIT
