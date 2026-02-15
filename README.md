# tailwindcss-chain

A Vite plugin that lets you chain multiple Tailwind CSS utilities under a shared variant prefix using pipe (`|`) syntax.

## The Problem

Tailwind variant prefixes get repetitive fast. When you need several utilities under the same variant, you end up repeating yourself:

```html
<div class="md:hover:bg-blue-600 md:hover:text-white md:hover:scale-105 md:hover:shadow-lg">
```

## The Solution

With `tailwindcss-chain`, use a pipe to chain utilities under a single variant prefix:

```html
<div class="md:hover:bg-blue-600|text-white|scale-105|shadow-lg">
```

At build time, the plugin expands this back into standard Tailwind classes. Your output is identical -- your source code is just cleaner.

## Installation

```bash
npm install tailwindcss-chain
```

```bash
pnpm add tailwindcss-chain
```

```bash
yarn add tailwindcss-chain
```

## Setup

Add the plugin to your `vite.config.ts`. It must come **before** the Tailwind CSS plugin, since it uses `enforce: 'pre'` to transform your source files before Tailwind scans them for classes.

```ts
import tailwindcssChain from 'tailwindcss-chain'
import tailwindCSS from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcssChain(), tailwindCSS()]
})
```

## Syntax

The pipe character `|` separates utilities that share the same variant prefix:

```
variant:util1|util2|util3
```

This expands to:

```
variant:util1 variant:util2 variant:util3
```

The variant prefix is everything up to and including the last colon before the first utility. This means stacked variants work naturally.

## Examples

| Input | Expands To |
|-------|------------|
| `md:hover:bg-blue-600\|text-white\|scale-105` | `md:hover:bg-blue-600 md:hover:text-white md:hover:scale-105` |
| `md:max-lg:bg-red-500\|scale-110\|shadow-lg` | `md:max-lg:bg-red-500 md:max-lg:scale-110 md:max-lg:shadow-lg` |
| `dark:bg-gray-900\|text-white\|border-gray-700` | `dark:bg-gray-900 dark:text-white dark:border-gray-700` |
| `[&>svg]:w-5\|h-5\|text-current` | `[&>svg]:w-5 [&>svg]:h-5 [&>svg]:text-current` |
| `group-hover:md:translate-y-0\|opacity-100\|scale-100` | `group-hover:md:translate-y-0 group-hover:md:opacity-100 group-hover:md:scale-100` |

### Practical usage

**Responsive hover states:**

```html
<button class="md:hover:bg-blue-600|text-white|scale-105">
  Submit
</button>
```

**Dark mode theming:**

```html
<div class="dark:bg-gray-900|text-white|border-gray-700">
  Content
</div>
```

**Styling child elements with arbitrary variants:**

```html
<div class="[&>svg]:w-5|h-5|text-current">
  <svg>...</svg>
</div>
```

**Range breakpoints:**

```html
<div class="md:max-lg:bg-red-500|scale-110|shadow-lg">
  Visible at md-lg only
</div>
```

## How It Works

`tailwindcss-chain` is a Vite plugin that transforms your source files at build time:

1. It registers with `enforce: 'pre'`, so it runs before Tailwind's Vite plugin scans for classes.
2. It finds tokens containing a pipe `|` outside of brackets, splits on the pipe, and prepends the shared variant prefix to each utility.
3. The expanded output is what Tailwind sees -- standard, fully-qualified class names.

This means there is **zero runtime cost**. All expansion happens during the build step, and your production bundle contains only standard Tailwind classes.

**Supported file types:** `.js`, `.jsx`, `.ts`, `.tsx`, `.html`, `.vue`, `.svelte`, `.astro`, `.md`, `.mdx`, `.blade.php`, `.php`

## Limitations

- **Vite only.** This is a Vite plugin. It does not work with webpack, Parcel, or other bundlers.
- **No pipes inside bracket expressions within a chain.** The pipe character inside square brackets (e.g., arbitrary values like `[color:red|blue]`) is treated as bracket content, not a chain separator. This is by design to avoid ambiguity with CSS selectors and arbitrary values that may contain `|`.

## License

[MIT](./LICENSE)
