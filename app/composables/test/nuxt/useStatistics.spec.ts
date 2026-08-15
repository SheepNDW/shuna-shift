import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useStatistics } from '~/composables/useStatistics';
import type { AgentStatistics, StatisticsResponse } from '~~/shared/types';

/**
 * `useFetch` 是 Nuxt auto-import，`vi.mock('#app')` 攔不到，必須用 mockNuxtImport。
 */
const { useFetchMock } = vi.hoisted(() => ({ useFetchMock: vi.fn() }));
mockNuxtImport('useFetch', () => useFetchMock);

const agent = (overrides: Partial<AgentStatistics> = {}): AgentStatistics => ({
  agentId: 'rin',
  name: '泠泠',
  picture: 'https://example.test/rin.jpg',
  dayCount: 56,
  nightCount: 59,
  total: 115,
  ...overrides,
});

interface FetchStub {
  statistics?: AgentStatistics[];
  dateRange?: { from: string; to: string };
  error?: Error | null;
  status?: string;
}

function stubFetch({
  statistics = [],
  dateRange = { from: '', to: '' },
  error = null,
  status = 'success',
}: FetchStub = {}) {
  const state = {
    data: ref<StatisticsResponse>({
      statistics,
      metadata: { lastUpdated: '2024-10-28T04:30:00.000Z', dateRange, totalSchedules: 0 },
    }),
    error: ref<Error | null>(error),
    status: ref(status),
  };
  useFetchMock.mockReturnValue(state);
  return state;
}

describe('useStatistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubFetch();
  });

  // 這個 key 是 /statistics 與探員頁共用同一份快取的唯一保證。改回分歧的 key
  // （例如探員頁原本自己的 'agent-detail-statistics'）會無聲退回雙重請求。
  it('應該以固定的 key 讓兩個頁面共用同一份 asyncData', async () => {
    await useStatistics();

    // 逐一取參數而非 toHaveBeenCalledWith：Nuxt 的 build transform 會補上第三個
    // 參數（自動生成的 key hash），整組比對會被那個實作細節綁死。
    const [url, options] = useFetchMock.mock.calls[0] ?? [];
    expect(url).toBe('/api/statistics');
    expect(options).toMatchObject({ key: 'statistics' });
  });

  it('應該帶上 TTL 快取策略', async () => {
    await useStatistics();

    const [, options] = useFetchMock.mock.calls[0] ?? [];
    expect(typeof (options as { getCachedData?: unknown }).getCachedData).toBe('function');
  });

  it('應該回傳統計陣列與日期範圍', async () => {
    stubFetch({ statistics: [agent()], dateRange: { from: '5月15日', to: '8月15日' } });

    const { statistics, dateRange } = await useStatistics();

    expect(statistics.value).toHaveLength(1);
    expect(statistics.value[0]?.agentId).toBe('rin');
    expect(dateRange.value).toEqual({ from: '5月15日', to: '8月15日' });
  });

  it('還沒載到時應該是空陣列而非 undefined', async () => {
    const { statistics } = await useStatistics();

    expect(statistics.value).toEqual([]);
  });

  describe('hasError', () => {
    it('沒有錯誤時為 false', async () => {
      const { hasError } = await useStatistics();

      expect(hasError.value).toBe(false);
    });

    it('有錯誤時為 true', async () => {
      stubFetch({ error: new Error('statistics down') });

      const { hasError } = await useStatistics();

      expect(hasError.value).toBe(true);
    });
  });

  describe('isPending', () => {
    // status 字串打錯（例如 'Pending'）會讓 isPending 永遠 false，
    // /statistics 的 LoadingState 就再也不會出現。
    it('status 為 pending 時為 true', async () => {
      stubFetch({ status: 'pending' });

      const { isPending } = await useStatistics();

      expect(isPending.value).toBe(true);
    });

    it('status 為 success 時為 false', async () => {
      stubFetch({ status: 'success' });

      const { isPending } = await useStatistics();

      expect(isPending.value).toBe(false);
    });

    it('status 為 error 時為 false —— 錯誤要走 hasError，不能卡在載入中', async () => {
      stubFetch({ status: 'error', error: new Error('statistics down') });

      const { isPending, hasError } = await useStatistics();

      expect(isPending.value).toBe(false);
      expect(hasError.value).toBe(true);
    });
  });
});
