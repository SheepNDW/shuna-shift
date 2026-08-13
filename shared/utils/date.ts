/**
 * 時區與 ISO 日期的共用基礎 —— 前端顯示（`app/utils/date.ts`）與後端統計
 * （`server/utils/statistics.ts`）都吃這一組，兩邊對「今天」必然同一個答案。
 *
 * 全站的「現在」一律以台北時區判定。不固定時區的話，SSR 與瀏覽器會對「今天」
 * 有不同答案：server 通常跑 UTC（本專案部署在 Vercel functions，即是如此），
 * 而使用者在 UTC+8，於是每天台灣時間 00:00–08:00 這 8 小時內 server 算出來的
 * 日期比使用者早一天。
 *
 * 用 `Intl` 顯式指定而不是靠 `TZ=Asia/Taipei` 環境變數：前者不依賴部署環境設定，
 * 測試也能在任何機器的時區下跑出相同結果。
 *
 * 日期一律以 ISO（`yyyy-mm-dd`）作為事實來源，「X月Y日」標籤只用於顯示。
 * 標籤不帶年份，比較時得在「前一年 / 當年 / 隔年」裡猜一個，歷史班表累積超過
 * 12 個月就會出現兩個無法區分的「1月5日」。
 */
const TIME_ZONE = 'Asia/Taipei';

/** 台北時區的日期時間欄位 */
export interface TaipeiParts {
  year: number;
  /** 1-12（非 0-based） */
  month: number;
  day: number;
  /** 0-23 */
  hour: number;
  minute: number;
}

/**
 * 建一次重複用：`Intl.DateTimeFormat` 的建構相對昂貴，而這裡的設定是固定的。
 *
 * locale 給 `'en-CA'` 只是要一個確定的值 —— 底下一律走 `formatToParts` 逐欄取值、
 * 不用 `format()` 的輸出字串，所以 locale 不影響結果（數字欄位不會被在地化成
 * 其他字集）。真正重要的是 `timeZone`。
 */
const TAIPEI_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  // h23 而非 hour12: false —— 後者在部分 ICU 版本會把午夜格式化成 24
  hourCycle: 'h23',
});

/** 取出某一時刻在台北時區的年月日時分 */
export function getTaipeiParts(date: Date = new Date()): TaipeiParts {
  const parts = TAIPEI_FORMATTER.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((candidate) => candidate.type === type);
    // 正常情況不會發生（無效 Date 會讓 formatToParts 先拋 RangeError）。
    // 寧可炸掉也不要用預設值靜默生出 year 0 之類的鬼日期。
    if (!part) throw new Error(`[date] Intl 未產出 ${type} 欄位`);
    return Number(part.value);
  };

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
  };
}

const pad = (value: number): string => String(value).padStart(2, '0');

/** ISO 日期（`yyyy-mm-dd`）的格式。用於擋掉誤傳進來的顯示標籤或空值。 */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 是否為 `yyyy-mm-dd` 格式的字串（僅驗格式，不驗該日期是否真的存在） */
export function isIsoDate(value: string): boolean {
  return ISO_DATE_PATTERN.test(value);
}

/**
 * 由年月日組出 ISO 日期字串。
 * @param month 1-12（非 0-based）
 */
export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** 台北時區的今天，ISO 日期格式 */
export function getTodayIso(): string {
  const { year, month, day } = getTaipeiParts();
  return toIsoDate(year, month, day);
}

/**
 * 把 ISO 日期轉成「只用來做日期運算」的 Date。
 *
 * 固定落在 UTC 正午而非 00:00，是為了讓任何時區位移都不會把日期推到前後一天。
 * 這種 Date 的時分秒沒有意義，只有日期部分可用，故一律以 `getUTC*` 讀取。
 *
 * 格式不符時回傳 null —— 呼叫端多半把它當成「沒有日期」而非錯誤。
 */
export function isoToUtcDate(iso: string): Date | null {
  if (!isIsoDate(iso)) return null;

  const date = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * ISO 日期 → 顯示用標籤（`'2026-08-31'` → `'8月31日'`）。
 * 月與日不補零，維持班表原本的呈現方式。格式不符時回傳空字串。
 *
 * 純字串處理：`isIsoDate` 已保證格式，這裡只要去掉補零，不涉及日曆運算，
 * 不必為此繞一趟 `Date`。
 */
export function isoToDateLabel(iso: string): string {
  if (!isIsoDate(iso)) return '';

  const [, month, day] = iso.split('-');
  return `${Number(month)}月${Number(day)}日`;
}

/**
 * ISO 日期加減月份。格式不符時回傳空字串。
 *
 * 沿用 `Date.UTC` 的月份溢位正規化，因此月底往回推會落到隔月
 * （5月31日 − 3 個月 → 2月31日 → 3月3日）。這是刻意保留的性質，不是將就：
 * 溢位讓視窗兩端同步位移，長度固定、cutoff 每天前進一天，昨天與今天的統計可比。
 * 若改成 clamp 到月底（2月28日），左端會在 5/28–5/31 連續四天卡住不動，
 * 「近三個月」在月底會悄悄長成「近三個月又三天」再跳回。
 */
export function addMonthsToIso(iso: string, months: number): string {
  const date = isoToUtcDate(iso);
  if (!date) return '';

  const shifted = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate(), 12),
  );

  return toIsoDate(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
  );
}
