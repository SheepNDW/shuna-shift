import type { SheetsResponse, StatisticsResponse } from '~~/shared/types';
import { transformSheetDataToSchedules } from '../utils/transformer';
import {
  calculateAgentStatistics,
  filterRecentMonths,
  getDateRange,
  getLastScheduleDate,
} from '../utils/statistics';

export default defineCachedEventHandler(
  async (_event) => {
    const config = useRuntimeConfig();
    const { gsheetsKey, spreadsheetId } = config;

    if (!gsheetsKey || !spreadsheetId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing google sheets key or spreadsheet id',
      });
    }

    // 取得當前班表和歷史班表
    const ranges = ['每日班表!A5:C45', '過去班表20260101~!A5:C743'];
    const rangesParam = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?${rangesParam}&fields=sheets.data.rowData.values(userEnteredValue,userEnteredFormat.backgroundColor,textFormatRuns)&key=${gsheetsKey}`;

    try {
      console.log('fetch Sheets for statistics...');
      const res = await $fetch<SheetsResponse>(url);

      // 取得當前班表資料
      const currentRows = res?.sheets[0]?.data[0]?.rowData ?? [];
      const currentSchedules = transformSheetDataToSchedules(currentRows);

      // 取得歷史班表資料
      const historyRows = res?.sheets[1]?.data[0]?.rowData ?? [];
      const historySchedules = transformSheetDataToSchedules(historyRows);

      // 合併班表資料（歷史資料在前，當前資料在後）
      const allSchedules = [...historySchedules, ...currentSchedules];

      // 取得資料最後一筆的日期作為統計基準
      const lastDate = getLastScheduleDate(allSchedules);

      // 截取近三個月的資料（以資料最後一筆日期為基準）
      const recentSchedules = filterRecentMonths(allSchedules, 3, lastDate ?? undefined);

      // 計算統計資料
      const statistics = calculateAgentStatistics(recentSchedules);

      // 取得實際資料的日期範圍
      const dateRange = getDateRange(recentSchedules);

      return {
        statistics,
        metadata: {
          lastUpdated: new Date().toISOString(),
          dateRange,
          totalSchedules: recentSchedules.length,
        },
      } satisfies StatisticsResponse;
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error instanceof Error ? error.message : 'Failed to fetch statistics',
      });
    }
  },
  {
    name: 'statistics-get',
    // Cache for 6 hours (maxAge is in seconds)
    maxAge: 6 * 60 * 60,
  },
);
