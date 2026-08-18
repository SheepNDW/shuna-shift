/**
 * query string 裡的 API key。取 `?key=` / `&key=` 開頭，避免誤中 `apikey=` 之類的字尾巧合。
 */
const API_KEY_QUERY = /([?&]key=)[^&\s"']+/g;

/**
 * 把錯誤整理成可以安全寫進 log 的字串。
 *
 * 直接 `console.error(msg, error)` 會把 ofetch 的 `FetchError` 原樣印出，而它的
 * message 內含**完整請求 URL** —— 其中有 `key=<NUXT_GSHEETS_KEY>`。那行會進 Vercel
 * 的 runtime log，等於每次 Sheets 失敗就把 API key 寫一次到可被翻閱的地方。
 *
 * 保留 stack（定位問題靠它），只把 key 的值換掉。spreadsheet ID 不遮：那份試算表
 * 本來就是公開的，footer 的「朱雫班表 Google 表單」連結直接指向它。
 */
export function formatErrorForLog(error: unknown): string {
  const detail = error instanceof Error ? (error.stack ?? error.message) : String(error);

  return detail.replace(API_KEY_QUERY, '$1[REDACTED]');
}
