import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth'

// Prevent the real Apollo client from initialising during tests
vi.mock('@/apollo/client', () => ({
  apolloClient: {
    mutate: vi.fn(),
    clearStore: vi.fn(),
  },
}))

const AGENT_USER   = { id: '1', name: 'Agent Joe', role: 'agent' }
const CUSTOMER_USER = { id: '2', name: 'Alice',    role: 'customer' }

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ── initial state ────────────────────────────────────────────────────────
  it('isAuthenticated is false with no stored token', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
  })

  it('isAuthenticated is true when a JWT exists in localStorage', () => {
    localStorage.setItem('jwt', 'some.jwt.token')
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(true)
  })

  it('user is null when localStorage has no user', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
  })

  it('restores user from localStorage on init', () => {
    localStorage.setItem('user', JSON.stringify(AGENT_USER))
    const store = useAuthStore()
    expect(store.user).toEqual(AGENT_USER)
  })

  // ── role computeds ───────────────────────────────────────────────────────
  it('isAgent is true when role is "agent"', () => {
    localStorage.setItem('jwt', 'token')
    localStorage.setItem('user', JSON.stringify(AGENT_USER))
    const store = useAuthStore()
    expect(store.isAgent).toBe(true)
    expect(store.isCustomer).toBe(false)
  })

  it('isCustomer is true when role is "customer"', () => {
    localStorage.setItem('jwt', 'token')
    localStorage.setItem('user', JSON.stringify(CUSTOMER_USER))
    const store = useAuthStore()
    expect(store.isCustomer).toBe(true)
    expect(store.isAgent).toBe(false)
  })

  it('both isAgent and isCustomer are false with no user', () => {
    const store = useAuthStore()
    expect(store.isAgent).toBe(false)
    expect(store.isCustomer).toBe(false)
  })

  // ── signOut ──────────────────────────────────────────────────────────────
  it('signOut clears token and user refs', () => {
    localStorage.setItem('jwt', 'token')
    localStorage.setItem('user', JSON.stringify(CUSTOMER_USER))
    const store = useAuthStore()

    store.signOut()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
  })

  it('signOut removes jwt and user from localStorage', () => {
    localStorage.setItem('jwt', 'token')
    localStorage.setItem('user', JSON.stringify(CUSTOMER_USER))
    const store = useAuthStore()

    store.signOut()

    expect(localStorage.getItem('jwt')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('signOut calls apolloClient.clearStore()', async () => {
    const { apolloClient } = await import('@/apollo/client')
    const store = useAuthStore()

    store.signOut()

    expect(apolloClient.clearStore).toHaveBeenCalled()
  })
})
