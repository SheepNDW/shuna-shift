import type { StatisticsResponse } from '~~/shared/types';
import { transformSheetDataToSchedules } from '../utils/transformer';
import { fetchSheetRanges, fetchSheetTitles, resolveSheetTitle } from '../utils/sheets';
import { defineCdnCachedEventHandler } from '../utils/cache';
import { formatErrorForLog } from '../utils/log';
import {
  calculateAgentStatistics,
  filterRecentMonths,
  getDateRange,
  resolveStatisticsEndIso,
} from '../utils/statistics';

/** 當期班表 sheet 名稱 */
const CURRENT_SHEET_TITLE = '每日班表';
/**
 * 歷史班表 sheet 名稱前綴。
 * 實際名稱帶日期後綴（如 `過去班表20260101~`），換期會改名，故不寫死整個名稱，
 * 改以此前綴在執行期動態解析。
 */
const HISTORY_SHEET_PREFIX = '過去班表';
/** 班表資料的欄位範圍（開放式結束列，不寫死列數）*/
const SCHEDULE_COLUMNS = 'A5:C';

export default defineCdnCachedEventHandler(
  async (_event) => {
    try {
      // 先以輕量 metadata request 動態解析歷史 sheet 的實際名稱
      const titles = await fetchSheetTitles();
      const historyTitle = resolveSheetTitle(titles, HISTORY_SHEET_PREFIX);

      const sheetData = await fetchSheetRanges([
        `${CURRENT_SHEET_TITLE}!${SCHEDULE_COLUMNS}`,
        `${historyTitle}!${SCHEDULE_COLUMNS}`,
      ]);

      const currentRows = sheetData.get(CURRENT_SHEET_TITLE) ?? [];
      const historyRows = sheetData.get(historyTitle) ?? [];

      const currentSchedules = transformSheetDataToSchedules(currentRows);
      const historySchedules = transformSheetDataToSchedules(historyRows);

      // 合併班表資料（歷史資料在前，當前資料在後）
      const allSchedules = [...historySchedules, ...currentSchedules];

      // 統計基準取 min(今天, 資料最後一筆) —— 當期班表已排到月底以後，
      // 直接用最後一筆會把未來班次算成出勤（見 resolveStatisticsEndIso 註解）
      const endIso = resolveStatisticsEndIso(allSchedules);

      // 截取近三個月「已發生」的資料
      const recentSchedules = filterRecentMonths(allSchedules, 3, endIso);

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
      // 理由同 `sheet.get.ts` 的同一段：`createError()` 走不到 nitro 的 console.error 分支，
      // 不自己印就等於整條失敗路徑無聲。這支多一段動態解析歷史 sheet 名稱的流程，
      // 把前綴一併帶上，才分得出是解析不到 sheet 還是取資料失敗。
      console.error(
        `[api/statistics] 讀取失敗（當期 ${CURRENT_SHEET_TITLE}、歷史前綴 ${HISTORY_SHEET_PREFIX}）`,
        formatErrorForLog(error),
      );

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
