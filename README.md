# daily-word-search-generator

TypeScript CLI to generate daily word lists and word-search puzzle data using AI.

---

## 🚀 Overview

This project generates:

- themed word sets using Google Gemini
- validated word-search puzzles
- JSON and TypeScript outputs for frontend consumption
- historical daily data with date-based files

It is designed to act as a **content pipeline** for a separate frontend (e.g., React app).

---

## ⚡ Quick Start

```bash
npm install
cp .env.example .env
npm run daily -- --topic "coffee shop"
```

---

## 📦 Output

Generated files inside `generated/`:

- `daily-words.json`
- `daily-words.ts`
- `daily-puzzles.json`
- `daily-puzzles.ts`
- `daily-puzzles-YYYY-MM-DD.ts` (historical)

Optional external output (via `.env`):

- latest dated puzzle `.ts` copied to another project

---

## 🧠 Architecture

```
AI → normalize → validate → split → generate puzzles → validate → export
```

---

## 🧩 Generated Data Model

Each puzzle includes:

- grid (letter matrix)
- words (label + value)
- placements:
  - start / end
  - direction
  - full path (cell coordinates)

This allows frontend apps to render puzzles without recomputation.

---

## ⚙️ Commands

```bash
npm run generate
npm run build:puzzles
npm run daily
```

Additional:

```bash
npm run lint
npm run check
npm run validate
npm run format
```

---

## 🌍 Environment Variables

Example `.env`:

```dotenv
GEMINI_API_KEY=your_key
MODEL_NAME=gemini-2.5-flash
LANGUAGE=es
OUTPUT_DIR=./generated
LATEST_DATED_PUZZLES_TS_OUTPUT_DIR=
WORDS_COUNT=50
WORDS_REQUEST_COUNT=65
PUZZLE_COUNT=5
WORDS_PER_PUZZLE=10
GRID_SIZE=14
MAX_GENERATION_ATTEMPTS=3
```

### Notes

- `PUZZLE_COUNT * WORDS_PER_PUZZLE = WORDS_COUNT`
- `WORDS_REQUEST_COUNT >= WORDS_COUNT`
- historical files are generated automatically

---

## 🧑‍💻 Development

```bash
npm run lint
npm run check
npm run validate
```

---

## 🔐 Security

- `.env` is ignored
- API keys must never be committed

---

## 📁 Project Structure

```
src/
  ai/
  cli/
  config/
  output/
  puzzles/
  types/
  utils/
generated/
examples/
```

---

## 🎯 Intended Usage

This project is meant to power:

- React apps
- mobile puzzle games
- daily word platforms

The frontend should consume the generated `.ts` or `.json` files directly.

---

## 📜 License

MIT
