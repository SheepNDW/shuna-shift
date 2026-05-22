import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import PageHeader from '../../PageHeader.vue';

describe('PageHeader', () => {
  it('renders kanji, label and title', async () => {
    const wrapper = await mountSuspended(PageHeader, {
      props: {
        kanji: '表',
        label: 'SHIFT TIMETABLE · 班表',
        title: '完整班表',
      },
    });

    expect(wrapper.get('.kanji-mark').text()).toBe('表');
    expect(wrapper.get('.stamp-label').text()).toBe('SHIFT TIMETABLE · 班表');
    expect(wrapper.get('[data-testid="page-header-title"]').text()).toBe('完整班表');
  });

  it('marks the kanji stamp as decorative', async () => {
    const wrapper = await mountSuspended(PageHeader, {
      props: { kanji: '員', label: 'AGENTS', title: '探員圖鑑' },
    });

    expect(wrapper.get('.kanji-mark').attributes('aria-hidden')).toBe('true');
  });

  it('renders the subtitle only when provided', async () => {
    const without = await mountSuspended(PageHeader, {
      props: { kanji: '計', label: 'STATISTICS', title: '出勤統計' },
    });
    expect(without.find('[data-testid="page-header-subtitle"]').exists()).toBe(false);

    const withSubtitle = await mountSuspended(PageHeader, {
      props: {
        kanji: '計',
        label: 'STATISTICS',
        title: '出勤統計',
        subtitle: '近期排班紀錄',
      },
    });
    expect(withSubtitle.get('[data-testid="page-header-subtitle"]').text()).toBe('近期排班紀錄');
  });

  it('renders the meta slot only when provided', async () => {
    const without = await mountSuspended(PageHeader, {
      props: { kanji: '員', label: 'AGENTS', title: '探員圖鑑' },
    });
    expect(without.find('[data-testid="page-header-meta"]').exists()).toBe(false);

    const withMeta = await mountSuspended(PageHeader, {
      props: {
        kanji: '員',
        label: 'AGENTS',
        title: '探員圖鑑',
        meta: '正職 6 · 現役 12',
      },
    });
    expect(withMeta.get('[data-testid="page-header-meta"]').text()).toBe('正職 6 · 現役 12');
  });
});
