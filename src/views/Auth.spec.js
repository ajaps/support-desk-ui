import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Auth from './Auth.vue'

// ── mock external dependencies ────────────────────────────────────────────
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    signIn: vi.fn().mockResolvedValue({}),
    signUp: vi.fn().mockResolvedValue({}),
  }),
}))

// ── helpers ───────────────────────────────────────────────────────────────

function mountAuth() {
  return mount(Auth)
}

/**
 * Finds all <input> elements in the mounted component.
 * AppInput renders a real <input> so this works without stubs.
 *
 * Login mode order:  [email, password]
 * Register mode order: [name, email, password, confirmPassword]
 */
function getInputs(wrapper) {
  return wrapper.findAll('input')
}

async function typeInto(input, value) {
  await input.setValue(value)
}

async function switchToRegister(wrapper) {
  await wrapper.find('.auth-switch-link').trigger('click')
}

function getSubmitButton(wrapper) {
  // The primary full-width button is the submit action
  return wrapper.find('button.btn--primary')
}

// ── tests ─────────────────────────────────────────────────────────────────

describe('Auth.vue – login mode', () => {
  it('renders the login heading', () => {
    const wrapper = mountAuth()
    expect(wrapper.find('h2').text()).toContain('Welcome back')
  })

  it('shows only email and password inputs', () => {
    const wrapper = mountAuth()
    expect(getInputs(wrapper)).toHaveLength(2)
  })

  it('submit button is disabled when fields are empty', () => {
    const wrapper = mountAuth()
    expect(getSubmitButton(wrapper).element.disabled).toBe(true)
  })

  it('submit button is enabled when email and password are filled', async () => {
    const wrapper = mountAuth()
    const [email, password] = getInputs(wrapper)
    await typeInto(email, 'user@example.com')
    await typeInto(password, 'secret123')
    expect(getSubmitButton(wrapper).element.disabled).toBe(false)
  })

  it('submit button remains disabled with only email filled', async () => {
    const wrapper = mountAuth()
    const [email] = getInputs(wrapper)
    await typeInto(email, 'user@example.com')
    expect(getSubmitButton(wrapper).element.disabled).toBe(true)
  })
})

describe('Auth.vue – register mode', () => {
  let wrapper

  beforeEach(async () => {
    wrapper = mountAuth()
    await switchToRegister(wrapper)
  })

  it('renders the register heading', () => {
    expect(wrapper.find('h2').text()).toContain('Create your account')
  })

  it('shows name, email, password and confirm-password inputs (4 total)', () => {
    expect(getInputs(wrapper)).toHaveLength(4)
  })

  it('does NOT show the mismatch message when confirm password is empty', () => {
    expect(wrapper.find('.password-mismatch').exists()).toBe(false)
  })

  it('shows mismatch message when passwords differ', async () => {
    const [, , password, confirm] = getInputs(wrapper)
    await typeInto(password, 'secret123')
    await typeInto(confirm, 'different')
    expect(wrapper.find('.password-mismatch').exists()).toBe(true)
    expect(wrapper.find('.password-mismatch').text()).toContain('do not match')
  })

  it('hides mismatch message when passwords match', async () => {
    const [, , password, confirm] = getInputs(wrapper)
    await typeInto(password, 'secret123')
    await typeInto(confirm, 'secret123')
    expect(wrapper.find('.password-mismatch').exists()).toBe(false)
  })

  it('submit button is disabled when passwords do not match', async () => {
    const [name, email, password, confirm] = getInputs(wrapper)
    await typeInto(name, 'Alice')
    await typeInto(email, 'alice@example.com')
    await typeInto(password, 'secret123')
    await typeInto(confirm, 'wrong')
    expect(getSubmitButton(wrapper).element.disabled).toBe(true)
  })

  it('submit button is disabled when confirmPassword is empty', async () => {
    const [name, email, password] = getInputs(wrapper)
    await typeInto(name, 'Alice')
    await typeInto(email, 'alice@example.com')
    await typeInto(password, 'secret123')
    // confirm password left empty — passwordsMatch is false ('' !== 'secret123')
    expect(getSubmitButton(wrapper).element.disabled).toBe(true)
  })

  it('submit button is enabled when all fields are filled and passwords match', async () => {
    const [name, email, password, confirm] = getInputs(wrapper)
    await typeInto(name, 'Alice')
    await typeInto(email, 'alice@example.com')
    await typeInto(password, 'secret123')
    await typeInto(confirm, 'secret123')
    expect(getSubmitButton(wrapper).element.disabled).toBe(false)
  })

  it('submit button is disabled when name is missing even if passwords match', async () => {
    const [, email, password, confirm] = getInputs(wrapper)
    await typeInto(email, 'alice@example.com')
    await typeInto(password, 'secret123')
    await typeInto(confirm, 'secret123')
    expect(getSubmitButton(wrapper).element.disabled).toBe(true)
  })
})

describe('Auth.vue – mode switching', () => {
  it('switching to register clears confirm password state', async () => {
    const wrapper = mountAuth()
    await switchToRegister(wrapper)

    // type a mismatching confirm password
    const [, , password, confirm] = getInputs(wrapper)
    await typeInto(password, 'abc')
    await typeInto(confirm, 'xyz')
    expect(wrapper.find('.password-mismatch').exists()).toBe(true)

    // switch back to login then back to register — confirm should be cleared
    await wrapper.find('.auth-switch-link').trigger('click') // → login
    await wrapper.find('.auth-switch-link').trigger('click') // → register
    expect(wrapper.find('.password-mismatch').exists()).toBe(false)
  })

  it('shows Sign in link in register mode', async () => {
    const wrapper = mountAuth()
    await switchToRegister(wrapper)
    expect(wrapper.find('.auth-switch-link').text()).toContain('Sign in')
  })

  it('shows Sign up link in login mode', () => {
    const wrapper = mountAuth()
    expect(wrapper.find('.auth-switch-link').text()).toContain('Sign up')
  })
})
