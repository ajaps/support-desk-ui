import { describe, it, expect } from 'vitest'
import { createApp } from 'vue'
import { useTimeAgo } from './useTimeAgo'

// Mount a tiny component to satisfy onMounted/onUnmounted lifecycle requirements
function withSetup(composable) {
  let result
  const app = createApp({
    setup() {
      result = composable()
      return () => {}
    },
  })
  app.mount(document.createElement('div'))
  return result
}

describe('useTimeAgo – timeAgo()', () => {
  it('returns "-" for null', () => {
    const { timeAgo } = withSetup(useTimeAgo)
    expect(timeAgo(null)).toBe('-')
  })

  it('returns "-" for undefined', () => {
    const { timeAgo } = withSetup(useTimeAgo)
    expect(timeAgo(undefined)).toBe('-')
  })

  it('returns "-" for an invalid date string', () => {
    const { timeAgo } = withSetup(useTimeAgo)
    expect(timeAgo('not-a-date')).toBe('-')
  })

  it('returns a relative string for a valid ISO date', () => {
    const { timeAgo } = withSetup(useTimeAgo)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const result = timeAgo(oneHourAgo)
    // dayjs produces strings like "an hour ago" or "a few seconds ago"
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
    expect(result).not.toBe('-')
  })

  it('returns a relative string for a Date object', () => {
    const { timeAgo } = withSetup(useTimeAgo)
    const result = timeAgo(new Date())
    expect(result).not.toBe('-')
  })
})
