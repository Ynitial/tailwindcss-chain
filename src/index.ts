import type { Plugin } from 'vite'
import { expandChainedClasses } from './expand'

export { expandChainedClasses } from './expand'

const FILE_REGEX = /\.(jsx?|tsx?|html|vue|svelte|astro|mdx?|blade\.php|php)$/

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
