import { beforeEach } from 'vitest'

// Reset localStorage between every test for isolation
beforeEach(() => {
  localStorage.clear()
})
