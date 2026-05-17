import { z } from 'zod';
import type { RowData } from '~~/shared/types';

/** Google Sheets API spreadsheets.get 端點 */
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * 只取轉換班表所需的欄位，縮小回應體積。
 * 一併要 `sheets.properties.title`，讓資料可以用 sheet 名稱對應，不靠陣列索引。
 */
const SHEETS_FIELDS =
  'sheets.properties.title,sheets.data.rowData.values(userEnteredValue,userEnteredFormat.backgroundColor,textFormatRuns)';

/**
 * Sheets 回應的寬鬆 schema：只驗證轉換班表所需的骨架結構
 * （`sheets` 為陣列、`properties.title`、`data`/`rowData` 為陣列），
 * 儲存格內容保持寬鬆，避免 Google 偶發的欄位差異造成整體解析失敗。
 */
const rowDataSchema = z.object({ values: z.array(z.unknown()).optional() }).loose();

const sheetDataSchema = z.object({ rowData: z.array(rowDataSchema).optional() }).loose();

const sheetSchema = z
  .object({
    properties: z.object({ title: z.string() }).loose().optional(),
    data: z.array(sheetDataSchema).optional(),
  })
  .loose();

const sheetsResponseSchema = z.object({ sheets: z.array(sheetSchema) }).loose();

/**
 * 從 A1 notation 範圍字串取出 sheet 標題（`!` 之前的部分）。
 * @example sheetTitleFromRange('每日班表!A5:C') // → '每日班表'
 */
export function sheetTitleFromRange(range: string): string {
  const idx = range.indexOf('!');
  return idx === -1 ? range : range.slice(0, idx);
}

/**
 * 組裝 Google Sheets API 的查詢 URL。
 * @param spreadsheetId 試算表 ID
 * @param ranges A1 notation 範圍陣列，例如 `['每日班表!A5:C']`
 * @param apiKey Google Sheets API key
 */
export function buildSheetsUrl(spreadsheetId: string, ranges: string[], apiKey: string): string {
  const params = new URLSearchParams();
  for (const range of ranges) {
    params.append('ranges', range);
  }
  params.append('fields', SHEETS_FIELDS);
  params.append('key', apiKey);

  return `${SHEETS_API_BASE}/${spreadsheetId}?${params.toString()}`;
}

/**
 * 驗證 Sheets API 回應結構，並轉為以 sheet 標題為 key 的 Map。
 * 結構不符時拋錯，錯誤訊息帶有 Zod 的路徑資訊（哪個 sheet／哪一列），方便定位。
 * @param raw $fetch 取回的原始回應
 */
export function parseSheetsResponse(raw: unknown): Map<string, RowData[]> {
  const result = sheetsResponseSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    console.error('[sheets] 回應結構驗證失敗:', issues);
    throw new Error(`Google Sheets 回應結構異常: ${issues}`);
  }

  const map = new Map<string, RowData[]>();

  result.data.sheets.forEach((sheet, index) => {
    const title = sheet.properties?.title;
    if (!title) {
      console.warn(`[sheets] 第 ${index} 個 sheet 缺少 properties.title，已略過`);
      return;
    }

    const rows = (sheet.data ?? []).flatMap((data) => data.rowData ?? []);
    // Zod 已驗證列的骨架；儲存格內容刻意保持寬鬆（z.unknown），
    // 在此邊界斷言為 Cell —— transformer／parser 後續以可選鏈防禦性讀取。
    map.set(title, rows as RowData[]);
  });

  return map;
}

/**
 * 向 Google Sheets API 取得指定範圍的資料。
 *
 * 回傳以 sheet 標題為 key 的 Map，呼叫端用 sheet 名稱取值，
 * 不再耦合 `ranges` 陣列的順序。
 *
 * 注意：若對「同一張 sheet」請求多個 range，Google 會合併為單一 sheet
 * 物件、多個 `data` 區塊，攤平後會落在同一個 key 而無法區分。目前各
 * range 分屬不同 sheet，不受此限制影響。
 * @param ranges A1 notation 範圍陣列，例如 `['每日班表!A5:C']`
 */
export async function fetchSheetRanges(ranges: string[]): Promise<Map<string, RowData[]>> {
  const { gsheetsKey, spreadsheetId } = useRuntimeConfig();

  if (!gsheetsKey || !spreadsheetId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing google sheets key or spreadsheet id',
    });
  }

  const url = buildSheetsUrl(spreadsheetId, ranges, gsheetsKey);
  const raw = await $fetch<unknown>(url);

  return parseSheetsResponse(raw);
}
