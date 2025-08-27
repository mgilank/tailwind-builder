# Tailwind Builder

A drag-and-drop builder focused on producing clean HTML + Tailwind CSS. Build sections quickly, tweak classes live, and export minified or readable HTML.

## Features
- Drag-and-drop elements: `section`, `div`, `button`, `h1–h5`, `text`, `link`.
- Live Tailwind preview with free-form class editing.
- Basic inspector: text, heading level, link `href`/`target`.
- Export HTML with optional minify, copy, and download.
- Undo/redo (Cmd/Ctrl+Z, Shift+Z).

## Stack
- Vite + React + TypeScript
- Tailwind CSS (JIT) + PostCSS
- Vitest (unit tests) with jsdom

## Quick Start
- Install: `npm i`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`
- Tests: `npm test`

## Project Structure
- `src/components/`: `Palette`, `Canvas`, `Inspector`
- `src/state/`: builder model, undo/redo
- `src/utils/`: `exporter.ts`, `minify.ts`
- `index.html`, `src/main.tsx`, `src/index.css`

## Usage
- Drag components from the left palette to the canvas.
- Click an element to select it; edit content and classes in the inspector.
- Toggle Minify in the header; use Copy HTML or Download to export.

## Testing
- Run unit tests: `npm test`
- Coverage and E2E can be added in later milestones; see `TODO.md`.

## Contributing
- See `AGENTS.md` for coding style, structure, and PR conventions.
- Open focused PRs with clear descriptions and screenshots for UI changes.

## Roadmap
- MVP (done): core drag/drop, edit, export, undo/redo, basic tests.
- Next (P1): palette search, outliner, autosave/import-export JSON, CI/lint.
- P2: validation rules, responsive/dark preview, shortcuts, advanced ops.

## Changelog

2025-08-27
- UI: Hide drag/close handles by default; show on hover or when selected. Center placeholder labels; keep content left-aligned.
- Defaults: Non-section components no longer full width; `div` uses `inline-block min-w-[80px]`; `heading` default size `text-[32px]`; `section` uses `flex flex-col items-start` with paddings `pt-[75px] pb-[75px] px-5`.
- Canvas: Removed dashed border and padding on root; solid border remains.
- Color pickers:
  - Tailwind swatches for text and background with family rows and 50–900 shades; solid color square previews.
  - Dedicated white/black row (two boxes), removed duplicate group entries.
  - Added IDs: `text-tailwind-colorpicker`, `bg-tailwind-colorpicker`.
  - General color pickers moved outside Tailwind pickers with IDs: `text-general-colorpicker`, `bg-general-colorpicker`.
  - Arbitrary colors applied via class tokens (e.g., `text-[#ff00aa]`) and previewed inline in Canvas.
  - Unified clear into one "Clear color" action per section.
- Fixes: Background swatch preview now shows actual color; general background color picker renders correctly.
