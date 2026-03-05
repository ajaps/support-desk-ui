import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from './AppButton.vue'

describe('AppButton', () => {
  // ── variants ─────────────────────────────────────────────────────────────
  it('uses "primary" variant by default', () => {
    const wrapper = mount(AppButton, { slots: { default: 'Click me' } })
    expect(wrapper.classes()).toContain('btn--primary')
  })

  it('applies "ghost" variant class', () => {
    const wrapper = mount(AppButton, { props: { variant: 'ghost' } })
    expect(wrapper.classes()).toContain('btn--ghost')
  })

  it('applies "danger" variant class', () => {
    const wrapper = mount(AppButton, { props: { variant: 'danger' } })
    expect(wrapper.classes()).toContain('btn--danger')
  })

  // ── size / width modifiers ────────────────────────────────────────────────
  it('applies "btn--sm" when sm prop is set', () => {
    const wrapper = mount(AppButton, { props: { sm: true } })
    expect(wrapper.classes()).toContain('btn--sm')
  })

  it('does not apply "btn--sm" by default', () => {
    const wrapper = mount(AppButton)
    expect(wrapper.classes()).not.toContain('btn--sm')
  })

  it('applies "btn--full" when full prop is set', () => {
    const wrapper = mount(AppButton, { props: { full: true } })
    expect(wrapper.classes()).toContain('btn--full')
  })

  // ── disabled state ────────────────────────────────────────────────────────
  it('is not disabled by default', () => {
    const wrapper = mount(AppButton)
    expect(wrapper.attributes('disabled')).toBeUndefined()
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(AppButton, { props: { disabled: true } })
    expect(wrapper.element.disabled).toBe(true)
  })

  // ── click emission ────────────────────────────────────────────────────────
  it('emits "click" when clicked', async () => {
    const wrapper = mount(AppButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  // ── slot content ──────────────────────────────────────────────────────────
  it('renders slot content', () => {
    const wrapper = mount(AppButton, { slots: { default: 'Save changes' } })
    expect(wrapper.text()).toBe('Save changes')
  })
})
