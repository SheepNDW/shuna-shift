import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AgentChip from '../../AgentChip.vue';

const NuxtLinkStub = defineComponent({
  inheritAttrs: false,
  template: '<a v-bind="$attrs"><slot /></a>',
});

const globalStubs = { NuxtLink: NuxtLinkStub } as const;

describe('AgentChip', () => {
  it('應顯示探員顯示名稱', async () => {
    const wrapper = await mountSuspended(AgentChip, {
      props: { name: '泠泠' },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="agent-chip-name"]').text()).toBe('泠泠');
  });

  it('探員可查得 id 時應渲染為連結並指向探員頁', async () => {
    const wrapper = await mountSuspended(AgentChip, {
      props: { name: '泠泠' },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="agent-chip"]').attributes('to')).toBe('/agents/rin');
  });

  it('探員查不到時應渲染為非連結元素', async () => {
    const wrapper = await mountSuspended(AgentChip, {
      props: { name: '查無此人' },
      global: { stubs: globalStubs },
    });

    const chip = wrapper.get('[data-testid="agent-chip"]');
    expect(chip.attributes('to')).toBeUndefined();
    expect(chip.element.tagName).toBe('SPAN');
  });

  it('highlighted 為 true 時應標記 data-highlighted', async () => {
    const wrapper = await mountSuspended(AgentChip, {
      props: { name: '泠泠', highlighted: true },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="agent-chip"]').attributes('data-highlighted')).toBe('true');
  });

  it('有 textColor 時應將其設為 --agent-color CSS 變數', async () => {
    const wrapper = await mountSuspended(AgentChip, {
      props: { name: '泠泠', textColor: '#ff9900' },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="agent-chip"]').attributes('style')).toContain(
      '--agent-color: #ff9900'
    );
  });

  it('帶括號的替班記錄應顯示原字串', async () => {
    const wrapper = await mountSuspended(AgentChip, {
      props: { name: '小楓(泠泠)' },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="agent-chip-name"]').text()).toBe('小楓(泠泠)');
  });
});
