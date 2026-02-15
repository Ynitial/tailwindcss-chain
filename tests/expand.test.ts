import { describe, it, expect } from 'vitest'
import { hasPipeOutsideBrackets, splitOnPipe, splitVariantPrefix, expandChainedClasses } from '../src/expand'

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

describe('expandChainedClasses with attributeOnly', () => {
  it('expands inside attribute values', () => {
    expect(expandChainedClasses('className="hover:a|b"', { attributeOnly: true }))
      .toBe('className="hover:a hover:b"')
  })

  it('does not expand bare tokens', () => {
    expect(expandChainedClasses('hover:a|b', { attributeOnly: true }))
      .toBe('hover:a|b')
  })

  it('does not mangle JS classList code', () => {
    const code = "document.querySelector('main').classList.add('hover:bg-red-500|scale-110')"
    expect(expandChainedClasses(code, { attributeOnly: true }))
      .toBe(code)
  })

  it('does not mangle JS bitwise or expressions', () => {
    const code = 'const x = a | b'
    expect(expandChainedClasses(code, { attributeOnly: true }))
      .toBe(code)
  })

  it('expands multiple attributes', () => {
    expect(expandChainedClasses('class="hover:a|b" id="x" data="md:c|d"', { attributeOnly: true }))
      .toBe('class="hover:a hover:b" id="x" data="md:c md:d"')
  })
})
