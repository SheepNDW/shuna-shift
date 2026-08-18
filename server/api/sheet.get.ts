import type { ScheduleResponse } from '~~/shared/types';
import { transformSheetDataToSchedules } from '../utils/transformer';
import { fetchSheetRanges, sheetTitleFromRange } from '../utils/sheets';
import { defineCdnCachedEventHandler } from '../utils/cache';
import { formatErrorForLog } from '../utils/log';

/** 當期班表範圍：開放式結束列，多排幾天也不會被截斷 */
const CURRENT_SHEET_RANGE = '每日班表!A5:C';

export default defineCdnCachedEventHandler(
  async (_event) => {
    try {
      const sheetData = await fetchSheetRanges([CURRENT_SHEET_RANGE]);
      const rows = sheetData.get(sheetTitleFromRange(CURRENT_SHEET_RANGE)) ?? [];

      const schedules = transformSheetDataToSchedules(rows);

      return {
        schedules,
        metadata: {
          lastUpdated: new Date().toISOString(),
        },
      } satisfies ScheduleResponse;
    } catch (error) {
      // nitro 的預設 error handler 只在 `error.unhandled || error.fatal` 時才 console.error
      // （見 nitropack `dist/runtime/internal/error.mjs`），而 `createError()` 產出的兩者
      // 皆非 —— 這裡不自己印的話，上游掛掉（API key 過期 / 配額用盡 / Google 5xx /
      // DNS 失敗）在 Vercel log 上完全沒有痕跡，只剩使用者端一個空狀態可看。
      // 經 formatErrorForLog 而非直接印 error：ofetch 的 FetchError 會把整個請求 URL
      // 塞進 message，其中含 `key=<NUXT_GSHEETS_KEY>`（見該函式的註解）。
      console.error(`[api/sheet] 讀取 ${CURRENT_SHEET_RANGE} 失敗`, formatErrorForLog(error));

      throw createError({
        statusCode: 500,
        statusMessage: error instanceof Error ? error.message : 'Failed to fetch sheets',
      });
    }
  },
  {
    name: 'sheet-get',
    // Cache for 3 hours
    maxAge: 60 * 60 * 3,
  }
);
