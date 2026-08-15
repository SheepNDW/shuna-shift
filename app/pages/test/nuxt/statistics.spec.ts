import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import StatisticsPage from '~/pages/statistics.vue';
import type { AgentStatistics } from '~~/shared/types';

/**
 * 這頁的分支曾經壞過一次：`useStatistics` 一律給 default 空殼後 `data` 永遠不為
 * null，而模板當時用 `v-else-if="data"` 當條件 —— 錯誤狀態因此永遠顯示不出來。
 * 這支測試把「載入中／失敗／有資料」三條路釘住，改回去會紅。
 */
const { useStatisticsMock } = vi.hoisted(() => ({ useStatisticsMock: vi.fn() }));
mockNuxtImport('useStatistics', () => useStatisticsMock);

const agent = (overrides: Partial<AgentStatistics> = {}): AgentStatistics => ({
  agentId: 'rin',
  name: '泠泠',
  picture: 'https://example.test/rin.jpg',
  dayCount: 56,
  nightCount: 59,
  total: 115,
  ...overrides,
});

function stubStatistics({
  statistics = [] as AgentStatistics[],
  hasError = false,
  isPending = false,
  dateRange = { from: '5月15日', to: '8月15日' },
} = {}) {
  useStatisticsMock.mockResolvedValue({
    statistics: ref(statistics),
    dateRange: ref(dateRange),
    hasError: ref(hasError),
    isPending: ref(isPending),
  });
}

describe('/statistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubStatistics();
  });

  it('載入中時顯示 LoadingState，不顯示錯誤或摘要', async () => {
    stubStatistics({ isPending: true });

    const wrapper = await mountSuspended(StatisticsPage);

    expect(wrapper.text()).toContain('載入統計資料中…');
    expect(wrapper.find('[data-testid="statistics-error"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="summary-tiles"]').exists()).toBe(false);
  });

  it('載入失敗時顯示錯誤狀態', async () => {
    stubStatistics({ hasError: true });

    const wrapper = await mountSuspended(StatisticsPage);

    expect(wrapper.find('[data-testid="statistics-error"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('無法載入統計資料');
  });

  it('有資料時顯示摘要與排行，不顯示錯誤狀態', async () => {
    stubStatistics({ statistics: [agent()] });

    const wrapper = await mountSuspended(StatisticsPage);

    expect(wrapper.find('[data-testid="summary-tiles"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="statistics-error"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('泠泠');
  });

  // 「查到了，但這段期間真的沒有任何班次」不是錯誤，不該顯示錯誤狀態
  it('成功但統計為空時不應顯示錯誤狀態', async () => {
    stubStatistics({ statistics: [] });

    const wrapper = await mountSuspended(StatisticsPage);

    expect(wrapper.find('[data-testid="statistics-error"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="summary-tiles"]').exists()).toBe(false);
  });

  it('應以資料的實際日期範圍呈現統計期間', async () => {
    stubStatistics({ statistics: [agent()], dateRange: { from: '5月15日', to: '8月15日' } });

    const wrapper = await mountSuspended(StatisticsPage);

    expect(wrapper.text()).toContain('5月15日 – 8月15日');
  });
});
