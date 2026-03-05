import { describe, it, expect, beforeEach } from 'vitest'
import { useGraphqlErrors } from './useGraphqlErrors'

describe('useGraphqlErrors', () => {
  let errors, hasErrors, firstError, clearErrors, captureErrors, safeCall

  beforeEach(() => {
    ;({ errors, hasErrors, firstError, clearErrors, captureErrors, safeCall } =
      useGraphqlErrors())
  })

  // ── initial state ────────────────────────────────────────────────────────
  it('starts with an empty errors array', () => {
    expect(errors.value).toEqual([])
    expect(hasErrors.value).toBe(false)
    expect(firstError.value).toBeNull()
  })

  // ── clearErrors ──────────────────────────────────────────────────────────
  it('clearErrors resets the errors array', () => {
    errors.value = ['some error']
    clearErrors()
    expect(errors.value).toEqual([])
  })

  // ── captureErrors – shape 1: top-level GQL errors ────────────────────────
  it('captures top-level GraphQL errors (shape 1)', () => {
    const result = { errors: [{ message: 'Not found' }, { message: 'Forbidden' }] }
    captureErrors(result)
    expect(errors.value).toEqual(['Not found', 'Forbidden'])
    expect(hasErrors.value).toBe(true)
    expect(firstError.value).toBe('Not found')
  })

  // ── captureErrors – shape 2: mutation-level validation errors ────────────
  it('captures mutation-level errors (shape 2)', () => {
    const result = {
      data: { signIn: { errors: ['Invalid email or password'] } },
    }
    captureErrors(result, 'signIn')
    expect(errors.value).toEqual(['Invalid email or password'])
  })

  it('ignores mutation key if key is absent in data', () => {
    const result = { data: {} }
    captureErrors(result, 'signIn')
    expect(errors.value).toEqual([])
  })

  // ── captureErrors – shape 3: thrown Error / network failure ──────────────
  it('captures a plain Error (shape 3 fallback)', () => {
    captureErrors(new Error('Network timeout'))
    expect(errors.value).toEqual(['Network timeout'])
  })

  it('prefers networkError.message from ApolloError when present', () => {
    const err = new Error('Apollo error')
    err.networkError = { message: 'Connection refused' }
    captureErrors(err)
    expect(errors.value).toEqual(['Connection refused'])
  })

  it('returns true when errors were found', () => {
    const found = captureErrors({ errors: [{ message: 'Oops' }] })
    expect(found).toBe(true)
  })

  it('returns false when no errors were found', () => {
    const found = captureErrors({ data: { ticket: { id: '1' } } })
    expect(found).toBe(false)
  })

  // ── safeCall ─────────────────────────────────────────────────────────────
  it('safeCall returns the result from a successful fn', async () => {
    const result = { data: { signIn: { token: 'abc', errors: [] } } }
    const fn = () => Promise.resolve(result)
    const returned = await safeCall(fn, 'signIn')
    expect(returned).toEqual(result)
    expect(errors.value).toEqual([])
  })

  it('safeCall captures mutation errors from a successful fn', async () => {
    const result = {
      data: { signIn: { errors: ['Wrong password'] } },
    }
    await safeCall(() => Promise.resolve(result), 'signIn')
    expect(errors.value).toEqual(['Wrong password'])
  })

  it('safeCall catches thrown errors and captures them', async () => {
    const fn = () => Promise.reject(new Error('Server down'))
    const returned = await safeCall(fn)
    expect(returned).toBeNull()
    expect(errors.value).toEqual(['Server down'])
  })

  it('safeCall clears previous errors before each call', async () => {
    errors.value = ['old error']
    await safeCall(() => Promise.resolve({}))
    expect(errors.value).toEqual([])
  })
})
