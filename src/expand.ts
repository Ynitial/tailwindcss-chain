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
  let i = 0
  let lastVariantEnd = 0

  while (i < token.length) {
    // Handle bracket groups like [&>div]
    if (token[i] === '[') {
      let depth = 1
      i++
      while (i < token.length && depth > 0) {
        if (token[i] === '[') depth++
        else if (token[i] === ']') depth--
        i++
      }
      // After closing bracket, expect a colon for it to be a variant
      if (i < token.length && token[i] === ':') {
        i++
        lastVariantEnd = i
        continue
      }
      break
    }

    // Regular variant segment: word chars and hyphens until colon
    while (i < token.length && token[i] !== ':' && token[i] !== '[' && token[i] !== '|') {
      i++
    }

    if (i < token.length && token[i] === ':') {
      i++
      lastVariantEnd = i
      continue
    }

    break
  }

  return {
    prefix: token.slice(0, lastVariantEnd),
    rest: token.slice(lastVariantEnd),
  }
}
