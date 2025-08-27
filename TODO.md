# Tailwind Builder TODO

## MVP Priorities
- P0: ship a usable HTML+Tailwind builder with minimal editing and export.
  - [x] Initialize project tooling (Vite+React+TS), Tailwind configured (JIT, content globs).
  - [x] Canvas with drag-and-drop for: section, div, button, h1–h5, text, link.
  - [x] Selection and basic edit: text content, heading level, link `href`/`target`.
  - [x] Tailwind class input (free-form text) applied live in preview.
  - [x] Export HTML generator + minify toggle; copy/download.
  - [x] Central state model with basic undo/redo.
  - [x] Unit tests: state transforms, exporter, minifier.
  - [ ] Smoke E2E: drag→edit→export.
- P1: quality-of-life and structure.
  - [x] Component palette sidebar.
  - [ ] Basic search in palette.
  - [ ] Hierarchy/outliner for nesting + reorder.
  - [ ] Autosave to `localStorage`; import/export project JSON.
  - [ ] ESLint/Prettier scripts.
  - [ ] CI for lint/tests.
  - [x] README updates.
- P2: polish and accessibility.
  - [ ] Validation (headings order, missing `href`, empty buttons) and nesting warnings.
  - [ ] Device presets, dark mode preview, Tailwind variant suggestions.
  - [ ] Shortcuts, context menu, duplicate/wrap/convert operations.

Derived from specs.md: drag-and-drop builder that outputs HTML + Tailwind CSS with an option to minify. Components: section, div, button, headings (h1–h5), text, link.

## Core Builder
- [x] Implement canvas with drag-and-drop for: section, div, button, h1–h5, text, link.
- [x] Component palette sidebar (tooltips, draggable items).
- [ ] Palette search and dedicated drag handles (optional).
- [ ] Hierarchy/outliner to view and reorder nested structure.
- [ ] Selection, move, duplicate, delete; context menu and keyboard shortcuts.

## Properties & Styling
- [x] Properties panel: edit text content; change heading level; set link `href`/`target`.
- [x] Style selectors for margin, padding, text color, background color (Tailwind classes applied automatically).
- [ ] Attributes: `id`, `title`, `aria-*` basics.
- [ ] Tailwind class editor with suggestions and validation (responsive + state variants).
- [ ] Common actions: wrap with container, add child, convert element type (where safe).

## Output & Export
- [x] Generate clean HTML with Tailwind classes from internal state.
- [x] Minify toggle for HTML output.
- [x] Export: copy to clipboard and download file.
- [ ] Optional: export project JSON for re-import.

## Preview & Styling Pipeline
- [x] Live preview that reflects Tailwind classes (JIT enabled).
- [ ] Device presets/breakpoints preview (sm/md/lg/xl) and dark mode toggle.
- [x] Ensure Tailwind `content` globs include dynamic class sources.

## State, Undo/Redo, Persistence
- [x] Central state model for nodes, props, and classes.
- [x] Undo/redo history; keyboard: `Cmd/Ctrl+Z`, `Shift+Z`.
- [ ] Autosave to `localStorage`; import/export project.

## Validation & Accessibility
- [ ] Basic checks: heading order, missing link `href`, empty button text.
- [ ] Warn on invalid nesting (e.g., interactive-in-interactive).

## Testing
- [x] Unit: state transforms (add/move/wrap), exporter, minifier.
- [ ] Integration/E2E: drag-drop flows, editing props, export actions.
- [ ] Snapshot only for stable markup; prefer explicit assertions elsewhere.

## Tooling & Scripts
- [x] Initialize Vite + React + TypeScript (or chosen stack).
- [ ] ESLint + Prettier + Tailwind plugin; `npm run lint`, `format`.
- [ ] Scripts: `lint`, `format`.
- [x] Scripts: `dev`, `build`, `test`.
- [ ] CI: run lint and tests on PRs.

## Documentation
- [x] Update `README` with setup, commands, and export instructions.
- [ ] Document supported components and known limitations.

## Stretch Goals
- [ ] Templates/presets for common sections (hero, CTA, footer).
- [ ] Multi-select and group operations.
- [ ] Smart alignment guides and snap-to-grid.
