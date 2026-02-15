# tailwindcss-chain Design

## Overview

A Vite plugin that expands pipe-separated Tailwind CSS utilities under shared variant prefixes at build time. Instead of repeating variant prefixes across multiple classes, chain them with `|`.

## Syntax

`variant:util1|util2|util3` expands to `variant:util1 variant:util2 variant:util3`

### Examples

| Input | Output |
|---|---|
| `md:max-lg:bg-red-500\|scale-110` | `md:max-lg:bg-red-500 md:max-lg:scale-110` |
| `hover:text-white\|underline\|scale-105` | `hover:text-white hover:underline hover:scale-105` |
| `dark:md:bg-black\|text-white` | `dark:md:bg-black dark:md:text-white` |

## Approach

Vite plugin running with `enforce: 'pre'` that transforms source files before Tailwind v4's scanner processes them. The expansion happens at build time with zero runtime cost.

## Edge Cases

- **Arbitrary values**: `md:bg-[#f00]|text-white` correctly expands (pipe outside brackets is the separator)
- **Pipes inside brackets**: `bg-[url(a|b)]` stays untouched (pipes inside `[]` are not separators)
- **Negative values**: `hover:-translate-x-4|opacity-50` works
- **No variant prefix**: `bg-red-500|text-white` is NOT expanded (requires at least one `variant:` prefix)
- **Arbitrary variants**: `[&>div]:text-red|font-bold` expands correctly

## Project Structure

```
tailwindcss-chain/
├── src/index.ts          # Vite plugin + expand function
├── tests/index.test.ts   # Unit tests
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── LICENSE (MIT)
```

## Usage

```ts
// vite.config.ts
import tailwindcssChain from 'tailwindcss-chain'
import tailwindCSS from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcssChain(), tailwindCSS()]
})
```

## Target

- Tailwind CSS v4
- Vite build tool
- Published to npm as `tailwindcss-chain`
