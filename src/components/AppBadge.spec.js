import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppBadge from './AppBadge.vue'

describe('AppBadge', () => {
  const cases = [
    { status: 'open',               label: 'Open',              cssClass: 'badge--open' },
    { status: 'awaiting_agent',     label: 'Awaiting Agent',    cssClass: 'badge--awaiting_agent' },
    { status: 'awaiting_customer',  label: 'Awaiting Customer', cssClass: 'badge--awaiting_customer' },
    { status: 'in_progress',        label: 'In Progress',       cssClass: 'badge--in_progress' },
    { status: 'closed',             label: 'Closed',            cssClass: 'badge--closed' },
  ]

  cases.forEach(({ status, label, cssClass }) => {
    it(`renders label "${label}" for status "${status}"`, () => {
      const wrapper = mount(AppBadge, { props: { status } })
      expect(wrapper.text()).toContain(label)
    })

    it(`applies CSS class "${cssClass}" for status "${status}"`, () => {
      const wrapper = mount(AppBadge, { props: { status } })
      expect(wrapper.classes()).toContain(cssClass)
    })
  })

  it('falls back to the raw status value when status is unknown', () => {
    const wrapper = mount(AppBadge, { props: { status: 'custom_status' } })
    expect(wrapper.text()).toContain('custom_status')
  })

  it('always renders a dot element', () => {
    const wrapper = mount(AppBadge, { props: { status: 'open' } })
    expect(wrapper.find('.badge-dot').exists()).toBe(true)
  })
})
