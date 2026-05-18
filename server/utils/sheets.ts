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

/** 只取 sheet 標題的輕量欄位，用於動態解析 sheet 名稱 */
const TITLES_FIELDS = 'sheets.properties.title';

/**
 * 歷史班表「使用中」的命名標記。
 *
 * 命名慣例：使用中的 sheet 以 `~` 結尾代表「起始日起持續累積」
 * （如 `過去班表20260101~`）；換期時舊 sheet 補上結束日封存
 * （如 `過去班表20250101~20251231`）。
 */
const OPEN_ENDED_MARKER = '~';

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
 * @param ranges A1 notation 範圍陣列，例如 `['每日班表!A5:C']`；傳空陣列代表只取 metadata
 * @param apiKey Google Sheets API key
 * @param fields 要取的欄位遮罩，預設為轉換班表所需的完整欄位
 */
export function buildSheetsUrl(
  spreadsheetId: string,
  ranges: string[],
  apiKey: string,
  fields: string = SHEETS_FIELDS,
): string {
  const params = new URLSearchParams();
  for (const range of ranges) {
    params.append('ranges', range);
  }
  params.append('fields', fields);
  params.append('key', apiKey);

  return `${SHEETS_API_BASE}/${spreadsheetId}?${params.toString()}`;
}

/**
 * 以 Zod 驗證 Sheets API 回應的骨架結構。
 * 結構不符時拋錯，錯誤訊息帶有 Zod 的路徑資訊（哪個 sheet／哪一列），方便定位。
 */
function validateSheetsResponse(raw: unknown): z.infer<typeof sheetsResponseSchema> {
  const result = sheetsResponseSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    console.error('[sheets] 回應結構驗證失敗:', issues);
    throw new Error(`Google Sheets 回應結構異常: ${issues}`);
  }

  return result.data;
}

/**
 * 取出 sheet 的標題；缺少 `properties.title` 時 `console.warn` 後回傳 undefined。
 * @param index sheet 在回應陣列中的索引，用於 log 定位
 */
function getSheetTitle(
  sheet: { properties?: { title?: string } },
  index: number,
): string | undefined {
  const title = sheet.properties?.title;
  if (!title) {
    console.warn(`[sheets] 第 ${index} 個 sheet 缺少 properties.title，已略過`);
    return undefined;
  }
  return title;
}

/**
 * 驗證 Sheets API 回應結構，並轉為以 sheet 標題為 key 的 Map。
 * @param raw $fetch 取回的原始回應
 */
export function parseSheetsResponse(raw: unknown): Map<string, RowData[]> {
  const map = new Map<string, RowData[]>();

  validateSheetsResponse(raw).sheets.forEach((sheet, index) => {
    const title = getSheetTitle(sheet, index);
    if (!title) return;

    const rows = (sheet.data ?? []).flatMap((block) => block.rowData ?? []);
    // Zod 已驗證列的骨架；儲存格內容刻意保持寬鬆（z.unknown），
    // 在此邊界斷言為 Cell —— transformer／parser 後續以可選鏈防禦性讀取。
    map.set(title, rows as RowData[]);
  });

  return map;
}

/**
 * 驗證 Sheets API 回應結構，並取出所有 sheet 的標題。
 * 缺少 title 的 sheet 會 `console.warn` 後略過（與 {@link parseSheetsResponse} 一致）。
 * @param raw $fetch 取回的原始回應
 */
export function parseSheetTitles(raw: unknown): string[] {
  const titles: string[] = [];

  validateSheetsResponse(raw).sheets.forEach((sheet, index) => {
    const title = getSheetTitle(sheet, index);
    if (title) titles.push(title);
  });

  return titles;
}

/** 使用中歷史班表的起始日格式：8 位數字 */
const START_DATE_PATTERN = /^\d{8}$/;

/**
 * 從 sheet 標題清單中找出「使用中」的歷史班表 sheet。
 *
 * 歷史班表命名慣例：`<前綴><8 位起始日>~[<8 位結束日>]`。
 *   - 使用中：結尾為 `~`、無結束日（如 `過去班表20260101~`）
 *   - 已封存：`~` 後接結束日（如 `過去班表20250101~20251231`）
 * 換期時舊 sheet 補上結束日封存、並開新的使用中 sheet。
 *
 * 採嚴格格式比對，排除前綴相符但非此格式的備份／暫存頁籤
 * （如 `過去班表20260101~備份`、`過去班表_old`）。
 *
 * 為避免靜默選錯資料源，**只在恰好找到一個使用中 sheet 時回傳**；
 * 找不到（命名慣例已破壞）或找到多個（換期中途並存）都拋錯，
 * 讓呼叫端 fail closed —— 明確失敗優於回傳缺漏或倒退的統計資料。
 * @param titles 試算表所有 sheet 的標題
 * @param prefix 歷史班表名稱前綴（如 `過去班表`）
 * @throws 找不到唯一使用中 sheet 時拋錯
 */
export function resolveSheetTitle(titles: string[], prefix: string): string {
  const active = titles.filter((title) => {
    if (!title.startsWith(prefix) || !title.endsWith(OPEN_ENDED_MARKER)) return false;
    // 前綴與結尾 `~` 之間須恰為 8 位數字起始日，藉此排除備份／暫存頁籤
    const startDate = title.slice(prefix.length, -OPEN_ENDED_MARKER.length);
    return START_DATE_PATTERN.test(startDate);
  });

  if (active.length === 1) {
    return active[0]!;
  }

  const prefixMatched = titles.filter((title) => title.startsWith(prefix));
  if (active.length === 0) {
    throw new Error(
      `找不到使用中的「${prefix}」sheet（須為 ${prefix}YYYYMMDD~ 格式）；` +
        `前綴相符者：${prefixMatched.join('、') || '無'}`,
    );
  }
  throw new Error(`找到多個使用中的「${prefix}」sheet，無法判定：${active.join('、')}`);
}

/** 取得並驗證 Sheets API 所需的設定 */
function getSheetsConfig(): { gsheetsKey: string; spreadsheetId: string } {
  const { gsheetsKey, spreadsheetId } = useRuntimeConfig();

  if (!gsheetsKey || !spreadsheetId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing google sheets key or spreadsheet id',
    });
  }

  return { gsheetsKey, spreadsheetId };
}

/**
 * 向 Google Sheets API 發出請求並回傳原始（未驗證）回應。
 * @param ranges A1 notation 範圍陣列；傳空陣列代表只取 metadata
 * @param fields 要取的欄位遮罩
 */
async function fetchSheetsRaw(ranges: string[], fields: string): Promise<unknown> {
  const { gsheetsKey, spreadsheetId } = getSheetsConfig();
  const url = buildSheetsUrl(spreadsheetId, ranges, gsheetsKey, fields);

  return $fetch<unknown>(url);
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
  return parseSheetsResponse(await fetchSheetsRaw(ranges, SHEETS_FIELDS));
}

/**
 * 以輕量 metadata request 取得試算表所有 sheet 的標題。
 *
 * 用於動態解析名稱會變動的 sheet（如帶日期後綴的歷史班表），
 * 搭配 {@link resolveSheetTitle} 使用。
 */
export async function fetchSheetTitles(): Promise<string[]> {
  return parseSheetTitles(await fetchSheetsRaw([], TITLES_FIELDS));
}
