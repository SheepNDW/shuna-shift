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
 */
export function formatDateTime(isoString: string, locale = 'zh-TW'): string {
  if (!isoString) return '';

  return new Date(isoString).toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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
