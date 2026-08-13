/**
 * 前端的日期顯示與「今天／未來」判定。
 *
 * 時區與 ISO 日期的基礎放在 `shared/utils/date.ts` —— server 端的統計視窗吃同一組
 * 函式，兩邊對「今天」必然同一個答案。
 *
 * 日期比較一律吃 `ShiftSchedule.date.iso`，不吃「X月Y日」標籤：標籤不帶年份，
 * 只能在「前一年 / 當年 / 隔年」裡挑離今天最近的一個，歷史班表一旦累積超過
 * 12 個月，同一個「1月5日」就會出現兩次且無法區分。吃 ISO 之後跨年判斷退化成
 * 單純的字串比較，不需要任何推算。
 */
import {
  getTaipeiParts,
  getTodayIso,
  isIsoDate,
  isoToDateLabel,
  isoToUtcDate,
} from '~~/shared/utils/date';

const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * 取得台北今天的月日格式（如：10月28日）
 */
export function getTodayLabel(): string {
  return isoToDateLabel(getTodayIso());
}

/**
 * 格式化 ISO 時間戳為本地化顯示，如 `2024/10/28 下午10:30`。
 *
 * 以台北時區呈現並手動組字串，確保 SSR 與瀏覽器輸出一致
 * （不用 toLocaleString，避免 ICU 版本差異造成 hydration mismatch）。
 *
 * 回傳空字串有兩種情況，呼叫端通常都顯示為「尚未載入」：
 * - 傳入空字串：資料還沒到，屬正常狀態，不出警告。
 * - 傳入無法解析的字串：屬非預期，會 `console.warn` 後才回傳空字串，
 *   免得壞掉的時間戳被靜默吞掉。
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return '';

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    console.warn(`[date] 無法解析的時間字串：${isoString}`);
    return '';
  }

  const { year, month, day, hour, minute } = getTaipeiParts(date);
  const period = hour < 12 ? '上午' : '下午';
  const hour12 = hour % 12 || 12;

  return `${year}/${pad(month)}/${pad(day)} ${period}${pad(hour12)}:${pad(minute)}`;
}

/**
 * 取得當前年份（台北時區）
 */
export function getCurrentYear(): number {
  return getTaipeiParts().year;
}

/**
 * 取得當前小時（台北時區，24 小時制）
 */
export function getCurrentHour(): number {
  return getTaipeiParts().hour;
}

/** 星期對照（0 = 星期日） */
const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'] as const;

/**
 * 解析「X月Y日」格式的日期標籤，取出月與日。
 *
 * 純粹是把顯示標籤拆成兩個數字供版面分開排版（大字月／大字日），不涉及年份，
 * 也不做任何日期運算 —— 需要比較日期時請改用吃 ISO 的函式。
 *
 * @param dateLabel - 日期標籤（格式：10月28日）
 * @returns 月與日的字串；格式不符時回傳 null
 */
export function parseDateLabel(dateLabel: string): { month: string; day: string } | null {
  const match = dateLabel.match(/(\d+)月(\d+)日/);
  if (!match || !match[1] || !match[2]) return null;

  return { month: match[1], day: match[2] };
}

/**
 * 取得 ISO 日期對應的星期中文字。
 * @param iso - ISO 日期（格式：2026-08-31）
 * @returns 星期單字（日～六）；格式不符時回傳空字串
 */
export function getWeekdayLabel(iso: string): string {
  const date = isoToUtcDate(iso);
  if (!date) return '';

  return WEEKDAY_LABELS[date.getUTCDay()] ?? '';
}

/**
 * 檢查 ISO 日期是否為台北的今天。
 * @param iso - ISO 日期（格式：2026-08-31）
 */
export function isToday(iso: string): boolean {
  return iso === getTodayIso();
}

/**
 * 檢查 ISO 日期是否為今天或未來。
 *
 * ISO 日期是固定長度、零填補的字串，字典序即等於時間序，故直接比字串。
 *
 * @param iso - ISO 日期（格式：2026-08-31）
 */
export function isTodayOrFuture(iso: string): boolean {
  if (!isIsoDate(iso)) return false;

  return iso >= getTodayIso();
}
