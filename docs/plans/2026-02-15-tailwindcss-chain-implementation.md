# tailwindcss-chain Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Vite plugin that expands pipe-separated Tailwind CSS utilities under shared variant prefixes at build time.

**Architecture:** A Vite `transform` plugin (`enforce: 'pre'`) processes source files before Tailwind v4's scanner. A pure `expandChainedClasses()` function handles the string transformation, and the Vite plugin is a thin wrapper that applies it to relevant file types.

**Tech Stack:** TypeScript, Vite (plugin API), Vitest (testing), tsup (bundling)

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `tsup.config.ts`
- Create: `LICENSE`
- Create: `src/index.ts` (empty placeholder)

**Step 1: Create package.json**

```json
{
  "name": "tailwindcss-chain",
  "version": "0.1.0",
  "description": "A Vite plugin that lets you chain multiple Tailwind CSS utilities under a shared variant prefix using pipe syntax",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["tailwindcss", "vite", "plugin", "variant", "chain", "group"],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/Ynitial/tailwindcss-chain"
  },
  "peerDependencies": {
    "vite": ">=5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0",
    "tsup": "^8.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Step 3: Create tsup.config.ts**

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
})
```

**Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
```

**Step 5: Create LICENSE (MIT)**

MIT license with Ynitial as copyright holder, year 2026.

**Step 6: Create placeholder src/index.ts**

```typescript
export {}
```

**Step 7: Install dependencies**

Run: `npm install`

**Step 8: Verify setup**

Run: `npx vitest run`
Expected: No tests found (that's OK, confirms vitest works)

**Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold project with TypeScript, Vitest, tsup"
```

---

### Task 2: Core Expand Function - Helper Utilities

**Files:**
- Create: `src/expand.ts`
- Create: `tests/expand.test.ts`

These helper functions handle bracket-aware string operations.

**Step 1: Write failing tests for helpers**

```typescript
import { describe, it, expect } from 'vitest'
import { hasPipeOutsideBrackets, splitOnPipe, splitVariantPrefix } from '../src/expand'

describe('hasPipeOutsideBrackets', () => {
  it('returns true when pipe is outside brackets', () => {
    expect(hasPipeOutsideBrackets('a|b')).toBe(true)
  })

  it('returns false when pipe is only inside brackets', () => {
    expect(hasPipeOutsideBrackets('bg-[url(a|b)]')).toBe(false)
  })

  it('returns false when no pipe', () => {
    expect(hasPipeOutsideBrackets('bg-red-500')).toBe(false)
  })

  it('returns true when pipe exists both inside and outside brackets', () => {
    expect(hasPipeOutsideBrackets('bg-[url(a|b)]|text-white')).toBe(true)
  })
})

describe('splitOnPipe', () => {
  it('splits on pipe outside brackets', () => {
    expect(splitOnPipe('bg-red-500|text-white')).toEqual(['bg-red-500', 'text-white'])
  })

  it('does not split on pipe inside brackets', () => {
    expect(splitOnPipe('bg-[url(a|b)]|text-white')).toEqual(['bg-[url(a|b)]', 'text-white'])
  })

  it('handles multiple pipes', () => {
    expect(splitOnPipe('a|b|c')).toEqual(['a', 'b', 'c'])
  })

  it('returns single-element array when no pipe', () => {
    expect(splitOnPipe('bg-red-500')).toEqual(['bg-red-500'])
  })
})

describe('splitVariantPrefix', () => {
  it('splits simple variant', () => {
    expect(splitVariantPrefix('hover:bg-red-500')).toEqual({ prefix: 'hover:', rest: 'bg-red-500' })
  })

  it('splits stacked variants', () => {
    expect(splitVariantPrefix('md:hover:bg-red-500')).toEqual({ prefix: 'md:hover:', rest: 'bg-red-500' })
  })

  it('splits range variants', () => {
    expect(splitVariantPrefix('md:max-lg:bg-red-500')).toEqual({ prefix: 'md:max-lg:', rest: 'bg-red-500' })
  })

  it('returns empty prefix when no variant', () => {
    expect(splitVariantPrefix('bg-red-500')).toEqual({ prefix: '', rest: 'bg-red-500' })
  })

  it('handles arbitrary variants', () => {
    expect(splitVariantPrefix('[&>div]:text-red')).toEqual({ prefix: '[&>div]:', rest: 'text-red' })
  })

  it('handles negative utility after variant', () => {
    expect(splitVariantPrefix('hover:-translate-x-4')).toEqual({ prefix: 'hover:', rest: '-translate-x-4' })
  })

  it('handles arbitrary value in utility', () => {
    expect(splitVariantPrefix('md:bg-[#f00]')).toEqual({ prefix: 'md:', rest: 'bg-[#f00]' })
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/expand.test.ts`
Expected: FAIL - cannot find module

**Step 3: Implement helpers in src/expand.ts**

```typescript
export function hasPipeOutsideBrackets(str: string): boolean {
  let depth = 0
  for (const ch of str) {
    if (ch === '[') depth++
    else if (ch === ']') depth--
    else if (ch === '|' && depth === 0) return true
  }
  return false
}

export function splitOnPipe(str: string): string[] {
  const parts: string[] = []
  let current = ''
  let depth = 0
  for (const ch of str) {
    if (ch === '[') { depth++; current += ch }
    else if (ch === ']') { depth--; current += ch }
    else if (ch === '|' && depth === 0) { parts.push(current); current = '' }
    else { current += ch }
  }
  parts.push(current)
  return parts
}

export function splitVariantPrefix(token: string): { prefix: string; rest: string } {
  // Walk through the token finding variant segments (ending with :)
  // A variant segment is: optional [bracketed] part + word chars/hyphens + colon
  let i = 0
  let lastVariantEnd = 0

  while (i < token.length) {
    // Try to match a variant segment starting at i
    const segStart = i

    // Handle bracket groups like [&>div]
    if (token[i] === '[') {
      let depth = 1
      i++
      while (i < token.length && depth > 0) {
        if (token[i] === '[') depth++
        else if (token[i] === ']') depth--
        i++
      }
      // After closing bracket, expect a colon
      if (i < token.length && token[i] === ':') {
        i++ // consume the colon
        lastVariantEnd = i
        continue
      }
      // Not a variant segment, break
      break
    }

    // Regular variant segment: word chars and hyphens until colon
    while (i < token.length && token[i] !== ':' && token[i] !== '[' && token[i] !== '|') {
      i++
    }

    if (i < token.length && token[i] === ':') {
      i++ // consume the colon
      lastVariantEnd = i
      continue
    }

    // Not a variant, we've gone past the prefix
    break
  }

  return {
    prefix: token.slice(0, lastVariantEnd),
    rest: token.slice(lastVariantEnd),
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/expand.test.ts`
Expected: All PASS

**Step 5: Commit**

```bash
git add src/expand.ts tests/expand.test.ts
git commit -m "feat: add bracket-aware string helpers for variant parsing"
```

---

### Task 3: Core Expand Function - expandChainedClasses

**Files:**
- Modify: `src/expand.ts` (add `expandChainedClasses`)
- Modify: `tests/expand.test.ts` (add tests)

**Step 1: Write failing tests**

Add to `tests/expand.test.ts`:

```typescript
import { expandChainedClasses } from '../src/expand'

describe('expandChainedClasses', () => {
  it('expands simple variant chain', () => {
    expect(expandChainedClasses('hover:bg-red-500|text-white'))
      .toBe('hover:bg-red-500 hover:text-white')
  })

  it('expands stacked variant chain', () => {
    expect(expandChainedClasses('md:hover:bg-red-500|text-white'))
      .toBe('md:hover:bg-red-500 md:hover:text-white')
  })

  it('expands range variant chain', () => {
    expect(expandChainedClasses('md:max-lg:bg-red-500|scale-110'))
      .toBe('md:max-lg:bg-red-500 md:max-lg:scale-110')
  })

  it('expands three utilities', () => {
    expect(expandChainedClasses('hover:a|b|c'))
      .toBe('hover:a hover:b hover:c')
  })

  it('handles arbitrary values', () => {
    expect(expandChainedClasses('md:bg-[#f00]|text-white'))
      .toBe('md:bg-[#f00] md:text-white')
  })

  it('ignores pipe inside brackets', () => {
    expect(expandChainedClasses('bg-[url(a|b)]'))
      .toBe('bg-[url(a|b)]')
  })

  it('does not expand without variant prefix', () => {
    expect(expandChainedClasses('bg-red-500|text-white'))
      .toBe('bg-red-500|text-white')
  })

  it('passes through normal classes', () => {
    expect(expandChainedClasses('md:bg-red-500 text-white'))
      .toBe('md:bg-red-500 text-white')
  })

  it('handles negative values', () => {
    expect(expandChainedClasses('hover:-translate-x-4|opacity-50'))
      .toBe('hover:-translate-x-4 hover:opacity-50')
  })

  it('expands multiple chains in one string', () => {
    expect(expandChainedClasses('hover:a|b md:c|d'))
      .toBe('hover:a hover:b md:c md:d')
  })

  it('handles arbitrary variant prefix', () => {
    expect(expandChainedClasses('[&>div]:text-red|font-bold'))
      .toBe('[&>div]:text-red [&>div]:font-bold')
  })

  it('preserves content around class strings', () => {
    expect(expandChainedClasses('class="hover:a|b" other'))
      .toBe('class="hover:a hover:b" other')
  })

  it('handles single utility with variant (no expansion needed)', () => {
    expect(expandChainedClasses('hover:bg-red-500'))
      .toBe('hover:bg-red-500')
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/expand.test.ts`
Expected: FAIL - expandChainedClasses not exported

**Step 3: Implement expandChainedClasses**

Add to `src/expand.ts`:

```typescript
export function expandChainedClasses(content: string): string {
  return content.replace(/\S+/g, (token) => {
    if (!hasPipeOutsideBrackets(token)) return token

    const { prefix, rest } = splitVariantPrefix(token)
    if (!prefix) return token

    const utilities = splitOnPipe(rest)
    if (utilities.length <= 1) return token

    return utilities.map(u => prefix + u).join(' ')
  })
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/expand.test.ts`
Expected: All PASS

**Step 5: Commit**

```bash
git add src/expand.ts tests/expand.test.ts
git commit -m "feat: add expandChainedClasses core transform function"
```

---

### Task 4: Vite Plugin

**Files:**
- Modify: `src/index.ts` (Vite plugin default export + re-export expand)
- Create: `tests/plugin.test.ts`

**Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import tailwindcssChain from '../src/index'

describe('Vite plugin', () => {
  const plugin = tailwindcssChain() as any

  it('has correct name', () => {
    expect(plugin.name).toBe('tailwindcss-chain')
  })

  it('enforces pre', () => {
    expect(plugin.enforce).toBe('pre')
  })

  it('transforms tsx files', () => {
    const result = plugin.transform('hover:bg-red-500|text-white', 'app.tsx')
    expect(result.code).toBe('hover:bg-red-500 hover:text-white')
  })

  it('transforms html files', () => {
    const result = plugin.transform('hover:bg-red-500|text-white', 'index.html')
    expect(result.code).toBe('hover:bg-red-500 hover:text-white')
  })

  it('transforms vue files', () => {
    const result = plugin.transform('hover:bg-red-500|text-white', 'App.vue')
    expect(result.code).toBe('hover:bg-red-500 hover:text-white')
  })

  it('transforms svelte files', () => {
    const result = plugin.transform('hover:bg-red-500|text-white', 'App.svelte')
    expect(result.code).toBe('hover:bg-red-500 hover:text-white')
  })

  it('transforms astro files', () => {
    const result = plugin.transform('hover:bg-red-500|text-white', 'Page.astro')
    expect(result.code).toBe('hover:bg-red-500 hover:text-white')
  })

  it('skips css files', () => {
    const result = plugin.transform('hover:bg-red-500|text-white', 'style.css')
    expect(result).toBeNull()
  })

  it('skips node_modules', () => {
    const result = plugin.transform('hover:bg-red-500|text-white', 'node_modules/lib/index.js')
    expect(result).toBeNull()
  })

  it('returns null when nothing changed', () => {
    const result = plugin.transform('bg-red-500 text-white', 'app.tsx')
    expect(result).toBeNull()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/plugin.test.ts`
Expected: FAIL

**Step 3: Implement Vite plugin in src/index.ts**

```typescript
import type { Plugin } from 'vite'
import { expandChainedClasses } from './expand'

export { expandChainedClasses } from './expand'

const FILE_REGEX = /\.(jsx?|tsx?|html|vue|svelte|astro|mdx?)$/

export default function tailwindcssChain(): Plugin {
  return {
    name: 'tailwindcss-chain',
    enforce: 'pre',
    transform(code, id) {
      if (!FILE_REGEX.test(id)) return null
      if (id.includes('node_modules')) return null

      const transformed = expandChainedClasses(code)
      if (transformed === code) return null

      return { code: transformed, map: null }
    },
  }
}
```

**Step 4: Run all tests**

Run: `npx vitest run`
Expected: All PASS

**Step 5: Verify build works**

Run: `npx tsup`
Expected: Builds successfully, outputs dist/index.js, dist/index.cjs, dist/index.d.ts

**Step 6: Commit**

```bash
git add src/index.ts tests/plugin.test.ts
git commit -m "feat: add Vite plugin wrapper"
```

---

### Task 5: README

**Files:**
- Create: `README.md`

**Step 1: Write README**

Write a comprehensive README covering:
- What it does (with before/after examples)
- Installation (`npm install tailwindcss-chain`)
- Setup (vite.config.ts)
- Syntax guide with examples
- Edge cases and limitations
- How it works (brief technical explanation)
- License

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with installation and usage guide"
```

---

### Task 6: Add .gitignore and final cleanup

**Files:**
- Create: `.gitignore`

**Step 1: Create .gitignore**

```
node_modules/
dist/
*.tgz
```

**Step 2: Run full test suite and build**

Run: `npx vitest run && npx tsup`
Expected: All tests pass, build succeeds

**Step 3: Commit and push**

```bash
git add .gitignore
git commit -m "chore: add .gitignore"
git push origin main
```
