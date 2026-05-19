import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ShiftGlyph from '../../ShiftGlyph.vue';

describe('ShiftGlyph', () => {
  it('早班渲染太陽圖示（含中心圓）', async () => {
    const wrapper = await mountSuspended(ShiftGlyph, {
      props: { type: 'day' },
    });

    expect(wrapper.find('svg').exists()).toBe(true);
    expect(wrapper.find('circle').exists()).toBe(true);
  });

  it('晚班渲染月亮圖示（僅 path、無圓）', async () => {
    const wrapper = await mountSuspended(ShiftGlyph, {
      props: { type: 'night' },
    });

    expect(wrapper.find('svg').exists()).toBe(true);
    expect(wrapper.find('circle').exists()).toBe(false);
    expect(wrapper.find('path').exists()).toBe(true);
  });

  it('圖示標記為裝飾性（aria-hidden）', async () => {
    const wrapper = await mountSuspended(ShiftGlyph, {
      props: { type: 'day' },
    });

    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true');
  });
});
