/**
 * 取得當前日期的月日格式（如：10月28日）
 */
export function getTodayLabel(): string {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  return `${month}月${day}日`;
}

/**
 * 格式化 ISO 時間戳為本地化顯示
 * 使用手動格式化確保 SSR 與瀏覽器輸出一致，避免 toLocaleString ICU 差異造成 hydration mismatch
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return '';

  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = d.getHours();
  const minute = String(d.getMinutes()).padStart(2, '0');
  const period = hour < 12 ? '上午' : '下午';
  const hour12 = String(hour % 12 || 12).padStart(2, '0');

  return `${year}/${month}/${day} ${period}${hour12}:${minute}`;
}

/**
 * 取得當前年份
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * 取得當前小時（24小時制）
 */
export function getCurrentHour(): number {
  return new Date().getHours();
}

/**
 * 檢查日期是否為今天
 */
export function isToday(dateLabel: string): boolean {
  return dateLabel === getTodayLabel();
}

/**
 * 檢查日期是否為今天或未來
 * @param dateLabel - 日期標籤（格式：10月28日）
 */
export function isTodayOrFuture(dateLabel: string): boolean {
  if (!dateLabel) return false;

  const today = new Date();
  const currentYear = today.getFullYear();

  // 解析日期標籤（例如：10月28日）
  const match = dateLabel.match(/(\d+)月(\d+)日/);
  if (!match || !match[1] || !match[2]) return false;

  const month = parseInt(match[1], 10) - 1; // JavaScript 的月份是 0-11
  const day = parseInt(match[2], 10);

  // 建立日期物件進行比較（時間設為 00:00:00）
  const targetDate = new Date(currentYear, month, day);
  const todayDate = new Date(currentYear, today.getMonth(), today.getDate());

  return targetDate >= todayDate;
}
