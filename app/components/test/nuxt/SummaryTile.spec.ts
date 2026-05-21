import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import SummaryTile from '../../SummaryTile.vue';

describe('SummaryTile', () => {
  it('應顯示漢字、label 與說明', async () => {
    const wrapper = await mountSuspended(SummaryTile, {
      props: {
        kanji: '日',
        label: 'DAY SHIFTS',
        desc: '早班總次數',
        value: 42,
        accent: 'day',
      },
    });

    expect(wrapper.text()).toContain('日');
    expect(wrapper.text()).toContain('DAY SHIFTS');
    expect(wrapper.get('[data-testid="summary-tile-desc"]').text()).toBe('早班總次數');
  });

  it('個位數數值應補零至兩位', async () => {
    const wrapper = await mountSuspended(SummaryTile, {
      props: {
        kanji: '夜',
        label: 'NIGHT SHIFTS',
        desc: '晚班總次數',
        value: 7,
        accent: 'night',
      },
    });

    expect(wrapper.get('[data-testid="summary-tile-value"]').text()).toBe('07');
  });

  it('三位數數值不應被截斷', async () => {
    const wrapper = await mountSuspended(SummaryTile, {
      props: {
        kanji: '總',
        label: 'TOTAL',
        desc: '班次總合',
        value: 243,
        accent: 'shu',
      },
    });

    expect(wrapper.get('[data-testid="summary-tile-value"]').text()).toBe('243');
  });

  it('有 subValue 時應顯示補充行', async () => {
    const wrapper = await mountSuspended(SummaryTile, {
      props: {
        kanji: '冠',
        label: 'MOST · MVP',
        desc: '泠泠',
        value: 30,
        accent: 'ink',
        subValue: '18 日 / 12 夜',
      },
    });

    expect(wrapper.get('[data-testid="summary-tile-sub"]').text()).toBe('18 日 / 12 夜');
  });

  it('無 subValue 時不應渲染補充行', async () => {
    const wrapper = await mountSuspended(SummaryTile, {
      props: {
        kanji: '日',
        label: 'DAY SHIFTS',
        desc: '早班總次數',
        value: 42,
        accent: 'day',
      },
    });

    expect(wrapper.find('[data-testid="summary-tile-sub"]').exists()).toBe(false);
  });

  it('應依 accent 套用對應色彩 class', async () => {
    const wrapper = await mountSuspended(SummaryTile, {
      props: {
        kanji: '夜',
        label: 'NIGHT SHIFTS',
        desc: '晚班總次數',
        value: 12,
        accent: 'night',
      },
    });

    expect(wrapper.html()).toContain('bg-night-soft');
    expect(wrapper.html()).toContain('border-night');
  });
});
