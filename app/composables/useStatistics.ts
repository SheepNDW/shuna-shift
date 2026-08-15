import type { StatisticsResponse } from '~~/shared/types';

/**
 * 統計的 asyncData key，/statistics 與探員頁共用一份。
 *
 * 原本探員頁指定 `agent-detail-statistics`、/statistics 用自動生成的 key，
 * 同一支 API 因此被當成兩份互不相干的快取，兩頁互相導航時各重抓一次。
 */
const STATISTICS_KEY = 'statistics';

/** 統計資料的新鮮度上限：超過就重打 API。伺服器端本身另有 6 小時快取。 */
const CACHE_TTL = 2 * 60 * 60 * 1000;

/** 還沒載到時的空殼。兩個呼叫端共用，避免各自對「沒資料」有不同解讀。 */
const emptyStatistics = (): StatisticsResponse => ({
  statistics: [],
  metadata: {
    lastUpdated: '',
    dateRange: { from: '', to: '' },
    totalSchedules: 0,
  },
});

/**
 * 近三個月的出勤統計。
 *
 * `hasError` 與 `isPending` 一起回傳，是因為呼叫端要分辨「這位探員真的零班」與
 * 「資料還沒到／拿不到」—— 後者顯示 0 等於在斷言一件我們其實不知道的事。
 */
export async function useStatistics() {
  const { data, error, status } = await useFetch<StatisticsResponse>('/api/statistics', {
    key: STATISTICS_KEY,
    default: emptyStatistics,
    getCachedData: makeTtlCache<StatisticsResponse>(CACHE_TTL),
    dedupe: 'defer',
  });

  const statistics = computed(() => data.value.statistics);
  const dateRange = computed(() => data.value.metadata.dateRange);
  const hasError = computed(() => Boolean(error.value));
  const isPending = computed(() => status.value === 'pending');

  return {
    statistics,
    dateRange,
    hasError,
    isPending,
  };
}
