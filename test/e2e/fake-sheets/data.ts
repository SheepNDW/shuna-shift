/**
 * e2e 用的假 Google Sheets 資料。
 *
 * 資料以「台北的今天」為原點，用「距離今天幾天」（offset）描述：今天是 0、明天是 1、
 * 昨天是 -1。不寫死日期，是因為首頁與 /shifts 只呈現今天以後的班 —— 寫死的資料
 * 過幾天就全部變成過去，測試會在沒人改程式的情況下轉紅。
 *
 * 這個檔案刻意不 import 任何專案程式碼：
 * - 假 server 是用 node 直接執行的（靠 type stripping），路徑別名與 nitro 的
 *   auto-import 在那裡都不存在。
 * - 日期換算自己算一份，才不會跟被測的程式用同一段邏輯互相印證。
 *
 * 假資料有沒有走樣，由 `server/utils/test/fake-sheets-contract.spec.ts` 拿正式的
 * parser 驗。
 */

const DAY_MS = 86_400_000;

/** Excel 日期序號的原點（序號 0） */
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);

export const CURRENT_SHEET_TITLE = '每日班表';
/** 使用中的歷史班表：`~` 結尾、沒有結束日 */
export const HISTORY_SHEET_TITLE = '過去班表20260101~';
/** 已封存的歷史班表。放一張進來，確認解析不會選錯 */
const ARCHIVED_SHEET_TITLE = '過去班表20250101~20251231';

/** 當期班表從幾天前開始（真的班表也會留著前幾天） */
const FIRST_CURRENT_OFFSET = -3;
/** 當期班表排到幾天後 */
const LAST_SCHEDULED_OFFSET = 13;
/** 歷史班表從幾天前開始。超過三個月，統計視窗的左端才落在資料裡 */
const FIRST_HISTORY_OFFSET = -100;

/** 今天起有排班的每一天（/shifts 會列出的日子） */
export const FUTURE_OFFSETS: readonly number[] = Array.from(
  { length: LAST_SCHEDULED_OFFSET + 1 },
  (_, offset) => offset,
);

/** 捲動測試的目標日：前面要有夠多天（不捲就看不到），後面也要有夠多天（才捲得到頂） */
export const SCROLL_TARGET_OFFSET = 7;

/** 今天當班的探員（頁面上顯示的名字，不是班表裡的寫法） */
export const TODAY_AGENTS = {
  day: ['泠泠', '景子'],
  night: ['Luna', '小楓'],
} as const;

/** 篩選測試用的探員：只在部分日子有班 */
export const FILTER_AGENT = '芽';

const mod = (value: number, divisor: number): number => ((value % divisor) + divisor) % divisor;

/** 篩選用的探員那天有沒有班：每四天輪到一次晚班 */
export function hasFilterAgent(offset: number): boolean {
  return mod(offset, 4) === 2;
}

interface Roster {
  day: string[];
  night: string[];
}

/** 某一天的當班名單，用班表實際的寫法：正職探員寫 emoji，其餘寫名字 */
function rosterFor(offset: number): Roster {
  const day = mod(offset, 2) === 0 ? ['🐷', '景子'] : ['🥨', '和実'];
  const night = hasFilterAgent(offset) ? ['🌙', '小楓', FILTER_AGENT] : ['🌙', '小楓'];

  return { day, night };
}

/** 台北時區的今天（`yyyy-mm-dd`） */
export function taipeiTodayIso(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${read('year')}-${read('month')}-${read('day')}`;
}

function isoToUtcMillis(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

/** ISO 日期加減天數 */
export function addDays(iso: string, days: number): string {
  return new Date(isoToUtcMillis(iso) + days * DAY_MS).toISOString().slice(0, 10);
}

function isoToExcelSerial(iso: string): number {
  return (isoToUtcMillis(iso) - EXCEL_EPOCH_UTC) / DAY_MS;
}

interface FakeCell {
  userEnteredValue?: { numberValue?: number; stringValue?: string };
  userEnteredFormat?: { backgroundColor: { red: number; green: number; blue: number } };
}

interface FakeRow {
  values: FakeCell[];
}

interface FakeSheet {
  properties: { title: string };
  data?: { rowData: FakeRow[] }[];
}

export interface FakeSpreadsheet {
  sheets: FakeSheet[];
}

const text = (stringValue: string): FakeCell => ({ userEnteredValue: { stringValue } });

/** 一天兩列：早班列的 A 欄有日期，緊接著的晚班列 A 欄是空的 */
function scheduledRows(todayIso: string, offset: number): FakeRow[] {
  const { day, night } = rosterFor(offset);
  const serial = isoToExcelSerial(addDays(todayIso, offset));

  return [
    { values: [{ userEnteredValue: { numberValue: serial } }, text('早'), text(day.join('、'))] },
    { values: [{}, text('晚'), text(night.join('、'))] },
  ];
}

/** 班表會把未來的日期格先用白底填好、探員欄留空，等排班時才上色 */
function unscheduledRows(todayIso: string, offset: number): FakeRow[] {
  const serial = isoToExcelSerial(addDays(todayIso, offset));
  const white = { backgroundColor: { red: 1, green: 1, blue: 1 } };

  return [
    {
      values: [
        { userEnteredValue: { numberValue: serial }, userEnteredFormat: white },
        text('早'),
        {},
      ],
    },
    { values: [{}, text('晚'), {}] },
  ];
}

function scheduledRange(todayIso: string, firstOffset: number, lastOffset: number): FakeRow[] {
  return Array.from({ length: lastOffset - firstOffset + 1 }, (_, index) =>
    scheduledRows(todayIso, firstOffset + index),
  ).flat();
}

const ROWS_BY_TITLE: Record<string, (todayIso: string) => FakeRow[]> = {
  [CURRENT_SHEET_TITLE]: (todayIso) => [
    ...scheduledRange(todayIso, FIRST_CURRENT_OFFSET, LAST_SCHEDULED_OFFSET),
    ...unscheduledRows(todayIso, LAST_SCHEDULED_OFFSET + 1),
  ],
  [HISTORY_SHEET_TITLE]: (todayIso) =>
    scheduledRange(todayIso, FIRST_HISTORY_OFFSET, FIRST_CURRENT_OFFSET - 1),
  [ARCHIVED_SHEET_TITLE]: () => [],
};

/**
 * 組出 `spreadsheets.get` 的回應。
 * @param ranges A1 notation 範圍；空陣列代表只要 metadata，回傳所有 sheet 的標題
 * @param todayIso 台北的今天
 * @throws 範圍指到不存在的 sheet 時拋錯（真的 API 會回 400）
 */
export function buildSpreadsheetResponse(ranges: string[], todayIso: string): FakeSpreadsheet {
  if (ranges.length === 0) {
    return { sheets: Object.keys(ROWS_BY_TITLE).map((title) => ({ properties: { title } })) };
  }

  return {
    sheets: ranges.map((range) => {
      const title = range.split('!')[0] ?? '';
      const buildRows = ROWS_BY_TITLE[title];
      if (!buildRows) throw new Error(`Unable to parse range: ${range}`);

      return { properties: { title }, data: [{ rowData: buildRows(todayIso) }] };
    }),
  };
}
