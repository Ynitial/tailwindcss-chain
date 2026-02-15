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

  it('transforms jsx attributes in tsx files', () => {
    const result = plugin.transform('className="hover:bg-red-500|text-white"', 'app.tsx')
    expect(result.code).toBe('className="hover:bg-red-500 hover:text-white"')
  })

  it('transforms jsx attributes in js files', () => {
    const result = plugin.transform('className="hover:bg-red-500|text-white"', 'app.js')
    expect(result.code).toBe('className="hover:bg-red-500 hover:text-white"')
  })

  it('does not mangle JS code with pipes in ts files', () => {
    const code = "document.querySelector('main').classList.add('hover:bg-red-500|scale-110')"
    const result = plugin.transform(code, 'app.ts')
    expect(result).toBeNull()
  })

  it('does not mangle JS code with pipes in js files', () => {
    const code = "const x = a | b"
    const result = plugin.transform(code, 'app.js')
    expect(result).toBeNull()
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

  it('transforms blade.php files', () => {
    const result = plugin.transform('hover:bg-red-500|text-white', 'resources/views/welcome.blade.php')
    expect(result.code).toBe('hover:bg-red-500 hover:text-white')
  })

  it('transforms php files', () => {
    const result = plugin.transform('hover:bg-red-500|text-white', 'resources/views/page.php')
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
