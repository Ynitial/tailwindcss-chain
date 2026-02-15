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
