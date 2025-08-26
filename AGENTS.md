# Repository Guidelines

## Project Structure & Module Organization
- Core code lives in `src/` (e.g., `src/components/`, `src/lib/`, `src/styles/`).
- Static assets in `public/` (icons, fonts, images).
- Configuration at the root (e.g., `tailwind.config.js`, `postcss.config.js`, `.editorconfig`).
- Tests in `tests/` or co-located as `*.test.ts(x)` next to source.
- Example layout:
  - `src/components/Button.tsx`
  - `src/styles/tailwind.css`
  - `public/favicon.svg`

## Build, Test, and Development Commands
- `npm ci` or `pnpm i`: install pinned dependencies.
- `npm run dev`: start local dev server with HMR.
- `npm run build`: create production build (includes Tailwind processing).
- `npm test`: run unit tests.
- `npm run lint` / `npm run format`: check and fix style issues.
Use your preferred package manager consistently (npm, pnpm, or yarn).

## Coding Style & Naming Conventions
- Indentation: 2 spaces; 100–120 char soft wrap.
- Language: TypeScript preferred (`.ts/.tsx`).
- Files: kebab-case for non-components (`card-list.ts`), PascalCase for React components (`CardList.tsx`).
- Functions/vars: camelCase; constants: UPPER_SNAKE_CASE.
- Lint/format: ESLint + Prettier; run `npm run lint` and `npm run format` before commits.

## Testing Guidelines
- Framework: Jest/Vitest; add Playwright/Cypress for E2E if needed.
- Location: `tests/` or co-located `*.test.ts(x)`.
- Naming: mirrors source path (e.g., `src/lib/slug.test.ts`).
- Aim for meaningful coverage on utilities and critical UI logic; avoid snapshot-only tests for complex components.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits, e.g., `feat(ui): add Button variants`.
- PRs: clear description, linked issues (e.g., `Closes #123`), screenshots for UI changes, notes on breaking changes and testing steps.
- Keep PRs focused and small; update docs when behavior changes.

## Security & Configuration Tips
- Do not commit secrets; use `.env.local` for development. Document required env vars in `README`.
- Pin Node version with `.nvmrc` and lockfile.
- Review Tailwind `content` globs to avoid shipping unused CSS.
