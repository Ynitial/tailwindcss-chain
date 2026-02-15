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

function expandToken(token: string): string {
  if (!hasPipeOutsideBrackets(token)) return token

  const { prefix, rest } = splitVariantPrefix(token)
  if (!prefix) return token

  const utilities = splitOnPipe(rest)
  if (utilities.length <= 1) return token

  return utilities.map(u => prefix + u).join(' ')
}

export function expandChainedClasses(content: string, options?: { attributeOnly?: boolean }): string {
  if (options?.attributeOnly) {
    // Only expand inside attribute="value" patterns — safe for JS/TS files
    // where bare tokens like classList.add('variant:a|b') must not be mangled
    return content.replace(/\w+=(['"])([^'"]*)\1/g, (match, quote, inner) => {
      const attrPrefix = match.slice(0, match.indexOf(quote))
      const expanded = inner.replace(/\S+/g, (tok: string) => expandToken(tok))
      return attrPrefix + quote + expanded + quote
    })
  }
  // Match attribute="value" patterns, then bare tokens
  return content.replace(/\w+=(['"])([^'"]*)\1|\S+/g, (match, quote, inner) => {
    if (quote) {
      // Inside an attribute value: expand each whitespace-delimited token
      const attrPrefix = match.slice(0, match.indexOf(quote))
      const expanded = inner.replace(/\S+/g, (tok: string) => expandToken(tok))
      return attrPrefix + quote + expanded + quote
    }
    return expandToken(match)
  })
}
