import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AgentChip from '../../AgentChip.vue';

// 不 stub NuxtLink:需驗證實際渲染出可導航的 <a>，而非無作用的 <nuxtlink> 元素。

describe('AgentChip', () => {
  it('應顯示探員顯示名稱', async () => {
    const wrapper = await mountSuspended(AgentChip, { props: { name: '泠泠' } });

    expect(wrapper.get('[data-testid="agent-chip-name"]').text()).toBe('泠泠');
  });

  it('探員可查得 id 時應渲染為真實 <a> 連結並指向探員頁', async () => {
    const wrapper = await mountSuspended(AgentChip, { props: { name: '泠泠' } });
    const chip = wrapper.get('[data-testid="agent-chip"]');

    expect(chip.element.tagName).toBe('A');
    expect(chip.attributes('href')).toBe('/agents/rin');
  });

  it('探員查不到時應渲染為非連結 span', async () => {
    const wrapper = await mountSuspended(AgentChip, { props: { name: '查無此人' } });
    const chip = wrapper.get('[data-testid="agent-chip"]');

    expect(chip.element.tagName).toBe('SPAN');
    expect(chip.attributes('href')).toBeUndefined();
  });

  it('highlighted 為 true 時應標記 data-highlighted', async () => {
    const wrapper = await mountSuspended(AgentChip, {
      props: { name: '泠泠', highlighted: true },
    });

    expect(wrapper.get('[data-testid="agent-chip"]').attributes('data-highlighted')).toBe('true');
  });

  it('有 textColor 時應將其設為 --agent-color CSS 變數', async () => {
    const wrapper = await mountSuspended(AgentChip, {
      props: { name: '泠泠', textColor: '#ff9900' },
    });

    expect(wrapper.get('[data-testid="agent-chip"]').attributes('style')).toContain(
      '--agent-color: #ff9900'
    );
  });

  it('帶括號的替班記錄應顯示原字串', async () => {
    const wrapper = await mountSuspended(AgentChip, { props: { name: '小楓(泠泠)' } });

    expect(wrapper.get('[data-testid="agent-chip-name"]').text()).toBe('小楓(泠泠)');
  });
});
