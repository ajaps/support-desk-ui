/**
 * GraphQL returns errors in three distinct shapes:
 *
 *  1. Top-level errors   → result.errors[]          (auth, not-found, depth limits)
 *  2. Mutation errors    → result.data.mutationName.errors[]  (validation)
 *  3. Network errors     → thrown by Apollo (no response at all)
 *
 * This composable normalises all three into a single reactive `errors` array
 * and exposes helpers used by every view and mutation.
 */

import { ref, computed } from 'vue'

export function useGraphqlErrors() {
  const errors = ref([])

  const hasErrors    = computed(() => errors.value.length > 0)
  const firstError   = computed(() => errors.value[0] ?? null)

  /** Clear all current errors */
  function clearErrors() {
    errors.value = []
  }

  /**
   * Extract and store errors from any GraphQL result.
   *
   * @param {object} result       - Raw Apollo result object
   * @param {string} mutationKey  - e.g. "signIn" — checks result.data[key].errors
   * @returns {boolean}           - true if there are errors (so callers can early-return)
   */
  function captureErrors(result, mutationKey = null) {
    clearErrors()
    const found = []

    // Shape 1: top-level GraphQL errors (auth failures, query errors)
    if (result?.errors?.length) {
      result.errors.forEach(e => found.push(e.message))
    }

    // Shape 2: mutation-level validation errors
    if (mutationKey && result?.data?.[mutationKey]?.errors?.length) {
      result.data[mutationKey].errors.forEach(e => found.push(e))
    }

    // Shape 3: ApolloError wrapping a network/HTTP failure
    if (result instanceof Error) {
      found.push(result.networkError?.message ?? result.message ?? 'Network error')
    }

    errors.value = found
    return found.length > 0
  }

  /**
   * Wrap any async GraphQL call. Catches network throws automatically.
   * Returns the raw result so the caller can still access .data.
   *
   * Usage:
   *   const { data } = await safeCall(() => mutate({ variables }), 'createTicket')
   */
  async function safeCall(fn, mutationKey = null) {
    clearErrors()
    try {
      const result = await fn()
      captureErrors(result, mutationKey)
      return result
    } catch (err) {
      captureErrors(err)
      return null
    }
  }

  return { errors, hasErrors, firstError, clearErrors, captureErrors, safeCall }
}