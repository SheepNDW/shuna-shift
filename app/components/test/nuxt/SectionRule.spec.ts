import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import SectionRule from '../../SectionRule.vue';

describe('SectionRule', () => {
  it('一律渲染左右兩條髮絲線', async () => {
    const wrapper = await mountSuspended(SectionRule);

    expect(wrapper.findAll('.bg-rule')).toHaveLength(2);
  });

  it('未提供 kanji / label 時不渲染中心 ornament', async () => {
    const wrapper = await mountSuspended(SectionRule);

    expect(wrapper.find('[data-testid="section-rule-kanji"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="section-rule-label"]').exists()).toBe(false);
  });

  it('提供 kanji 與 label 時渲染中心 ornament', async () => {
    const wrapper = await mountSuspended(SectionRule, {
      props: { kanji: '色', label: 'COLOR LEGEND' },
    });

    expect(wrapper.get('[data-testid="section-rule-kanji"]').text()).toBe('色');
    expect(wrapper.get('[data-testid="section-rule-label"]').text()).toBe('COLOR LEGEND');
  });

  it('只提供 label 時不渲染 kanji', async () => {
    const wrapper = await mountSuspended(SectionRule, {
      props: { label: '近日' },
    });

    expect(wrapper.find('[data-testid="section-rule-kanji"]').exists()).toBe(false);
    expect(wrapper.get('[data-testid="section-rule-label"]').text()).toBe('近日');
  });
});
