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

      // statusMessage 是固定字串，**不可**帶入 `error.message`：那是同一個含
      // `key=<NUXT_GSHEETS_KEY>` 的字串，而 nitro 的預設 error handler 會把
      // statusMessage 同時寫進 JSON body 的 `statusMessage` / `message` 與 HTTP
      // status line 的 reason phrase —— 上游只要正在故障，任何人打這支端點都拿得到
      // 我們的 API key。診斷資訊已經在上面那行 console.error 裡。
      // 也刻意維持 ASCII：statusMessage 會進 status line，非 ASCII 會被以 latin1 寫出。
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch sheets',
      });
    }
  },
  {
    name: 'sheet-get',
    // Cache for 3 hours
    maxAge: 60 * 60 * 3,
  }
);
