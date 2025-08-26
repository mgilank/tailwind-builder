# Tailwind Builder TODO

## MVP Priorities
- P0: ship a usable HTML+Tailwind builder with minimal editing and export.
  - [ ] Initialize project tooling (Vite+React+TS), Tailwind configured (JIT, content globs).
  - [ ] Canvas with drag-and-drop for: section, div, button, h1–h5, text, link.
  - [ ] Selection and basic edit: text content, heading level, link `href`/`target`.
  - [ ] Tailwind class input (free-form text) applied live in preview.
  - [ ] Export HTML generator + minify toggle; copy/download.
  - [ ] Central state model with basic undo/redo.
  - [ ] Unit tests: state transforms, exporter, minifier. Smoke E2E: drag→edit→export.
- P1: quality-of-life and structure.
  - [ ] Component palette sidebar and basic search.
  - [ ] Hierarchy/outliner for nesting + reorder.
  - [ ] Autosave to `localStorage`; import/export project JSON.
  - [ ] ESLint/Prettier scripts; CI for lint/tests; README updates.
- P2: polish and accessibility.
  - [ ] Validation (headings order, missing `href`, empty buttons) and nesting warnings.
  - [ ] Device presets, dark mode preview, Tailwind variant suggestions.
  - [ ] Shortcuts, context menu, duplicate/wrap/convert operations.

Derived from specs.md: drag-and-drop builder that outputs HTML + Tailwind CSS with an option to minify. Components: section, div, button, headings (h1–h5), text, link.

## Core Builder
- [ ] Implement canvas with drag-and-drop for: section, div, button, h1–h5, text, link.
- [ ] Component palette sidebar (search, tooltips, drag handle).
- [ ] Hierarchy/outliner to view and reorder nested structure.
- [ ] Selection, move, duplicate, delete; context menu and keyboard shortcuts.

## Properties & Styling
- [ ] Properties panel: edit text content; change heading level; set link `href`/`target`.
- [ ] Attributes: `id`, `title`, `aria-*` basics.
- [ ] Tailwind class editor with suggestions and validation (responsive + state variants).
- [ ] Common actions: wrap with container, add child, convert element type (where safe).

## Output & Export
- [ ] Generate clean HTML with Tailwind classes from internal state.
- [ ] Minify toggle for HTML output.
- [ ] Export: copy to clipboard and download file.
- [ ] Optional: export project JSON for re-import.

## Preview & Styling Pipeline
- [ ] Live preview that reflects Tailwind classes (JIT enabled).
- [ ] Device presets/breakpoints preview (sm/md/lg/xl) and dark mode toggle.
- [ ] Ensure Tailwind `content` globs include dynamic class sources.

## State, Undo/Redo, Persistence
- [ ] Central state model for nodes, props, and classes.
- [ ] Undo/redo history; keyboard: `Cmd/Ctrl+Z`, `Shift+Z`.
- [ ] Autosave to `localStorage`; import/export project.

## Validation & Accessibility
- [ ] Basic checks: heading order, missing link `href`, empty button text.
- [ ] Warn on invalid nesting (e.g., interactive-in-interactive).

## Testing
- [ ] Unit: state transforms (add/move/wrap), exporter, minifier.
- [ ] Integration/E2E: drag-drop flows, editing props, export actions.
- [ ] Snapshot only for stable markup; prefer explicit assertions elsewhere.

## Tooling & Scripts
- [ ] Initialize Vite + React + TypeScript (or chosen stack).
- [ ] ESLint + Prettier + Tailwind plugin; `npm run lint`, `format`.
- [ ] Scripts: `dev`, `build`, `test`, `lint`, `format`.
- [ ] CI: run lint and tests on PRs.

## Documentation
- [ ] Update `README` with setup, commands, and export instructions.
- [ ] Document supported components and known limitations.

## Stretch Goals
- [ ] Templates/presets for common sections (hero, CTA, footer).
- [ ] Multi-select and group operations.
- [ ] Smart alignment guides and snap-to-grid.
