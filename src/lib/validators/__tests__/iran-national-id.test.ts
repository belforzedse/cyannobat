import { describe, expect, it } from 'vitest'

import { isValidIranNationalId } from '@/lib/validators/iran-national-id'

describe('isValidIranNationalId', () => {
  const validLatin = '0499370899'
  const validPersian = '۰۴۹۹۳۷۰۸۹۹'
  const validMixed = '۰49٩٣7۰۸9۹'

  it('accepts valid IDs written with Latin digits', () => {
    expect(isValidIranNationalId(validLatin)).toBe(true)
  })

  it('normalizes Persian digits before validation', () => {
    expect(isValidIranNationalId(validPersian)).toBe(true)
  })

  it('normalizes mixed Persian, Arabic-Indic, and Latin digits', () => {
    expect(isValidIranNationalId(validMixed)).toBe(true)
  })

  it('rejects IDs with all identical digits', () => {
    expect(isValidIranNationalId('۰۰۰۰۰۰۰۰۰۰')).toBe(false)
  })
})
