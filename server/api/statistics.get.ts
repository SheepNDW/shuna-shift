import type { StatisticsResponse } from '~~/shared/types';
import { transformSheetDataToSchedules } from '../utils/transformer';
import {
  fetchSheetRanges,
  fetchSheetTitles,
  resolveSheetTitle,
  sheetTitleFromRange,
} from '../utils/sheets';
import { shouldBypassCache } from '../utils/cache';
import {
  calculateAgentStatistics,
  filterRecentMonths,
  getDateRange,
  getLastScheduleDate,
} from '../utils/statistics';

/** 當期班表範圍 */
const CURRENT_SHEET_RANGE = '每日班表!A5:C';
/**
 * 歷史班表 sheet 名稱前綴。
 * 實際名稱帶日期後綴（如 `過去班表20260101~`），換期會改名，故不寫死整個名稱，
 * 改以此前綴在執行期動態解析。
 */
const HISTORY_SHEET_PREFIX = '過去班表';

export default defineCachedEventHandler(
  async (_event) => {
    try {
      console.log('fetch Sheets for statistics...');

      // 先以輕量 metadata request 動態解析歷史 sheet 的實際名稱
      const titles = await fetchSheetTitles();
      const historyTitle = resolveSheetTitle(titles, HISTORY_SHEET_PREFIX);

      const sheetData = await fetchSheetRanges([CURRENT_SHEET_RANGE, `${historyTitle}!A5:C`]);

      // 以 sheet 標題對應資料，不依賴回傳順序
      const currentRows = sheetData.get(sheetTitleFromRange(CURRENT_SHEET_RANGE)) ?? [];
      const historyRows = sheetData.get(historyTitle) ?? [];

      const currentSchedules = transformSheetDataToSchedules(currentRows);
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
    shouldBypassCache,
  },
);
