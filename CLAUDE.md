# CLAUDE.md

## Project Overview

`tailwindcss-chain` is a Vite plugin that expands pipe-separated Tailwind CSS utilities under shared variant prefixes at build time. Instead of repeating `md:hover:` across multiple classes, users write `md:hover:bg-blue-600|text-white|scale-105` and the plugin expands it to `md:hover:bg-blue-600 md:hover:text-white md:hover:scale-105`.

## Commands

- `npm test` -- run all tests (vitest)
- `npm run test:watch` -- run tests in watch mode
- `npm run build` -- build with tsup (outputs ESM, CJS, and .d.ts to `dist/`)

## Architecture

Two source files, clear separation:

- **`src/expand.ts`** -- Pure string transformation logic, no Vite dependency
  - `hasPipeOutsideBrackets(str)` -- bracket-depth-aware pipe detection
  - `splitOnPipe(str)` -- splits string on `|` respecting `[]` nesting
  - `splitVariantPrefix(token)` -- separates Tailwind variant prefix (e.g. `md:hover:`) from utility (e.g. `bg-red-500`)
  - `expandToken(token)` -- internal, expands a single class token
  - `expandChainedClasses(content)` -- main export, expands all chains in a string (handles both bare tokens and tokens inside HTML attributes like `class="..."`)

- **`src/index.ts`** -- Vite plugin wrapper
  - Default export: `tailwindcssChain()` factory returning a Vite `Plugin`
  - `enforce: 'pre'` so it runs before Tailwind's Vite plugin
  - Filters by file extension (jsx, tsx, html, vue, svelte, astro, md, mdx, blade.php, php)
  - Skips `node_modules`
  - Re-exports `expandChainedClasses` for direct use

## Key Design Decisions

- **Pipe `|` as separator** -- chosen over underscore (conflicts with some Tailwind utilities) and semicolon (less readable)
- **Bracket-aware parsing** -- all string operations track `[]` nesting depth so pipes inside arbitrary values like `bg-[url(a|b)]` are not treated as separators
- **Attribute-aware expansion** -- `expandChainedClasses` matches `attr="value"` patterns to correctly expand chains inside HTML/JSX attributes, not just bare whitespace-delimited tokens
- **No expansion without variant prefix** -- `bg-red-500|text-white` (no variant prefix) is intentionally left unchanged; only `variant:util1|util2` triggers expansion
- **Build-time only** -- zero runtime cost, all expansion happens during Vite's transform phase

## Testing

Tests are in `tests/` using Vitest:
- `tests/expand.test.ts` -- 28 tests for the core expansion logic (helpers + expandChainedClasses)
- `tests/plugin.test.ts` -- 12 tests for the Vite plugin (file type filtering, node_modules skip, null on no-change)

When adding new features, write the test first (TDD). Test edge cases around bracket nesting and variant prefix parsing.

## Code Conventions

- TypeScript strict mode
- No runtime dependencies (only `vite` as peer dep)
- ESM-first (`"type": "module"` in package.json)
- Functions are small and single-purpose
- Character-by-character parsing preferred over complex regexes for bracket-aware operations
