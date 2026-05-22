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

/** 星期對照（0 = 星期日） */
const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'] as const;

/**
 * 解析「X月Y日」格式的日期標籤，取出月與日。
 * @param dateLabel - 日期標籤（格式：10月28日）
 * @returns 月與日的字串；格式不符時回傳 null
 */
export function parseDateLabel(dateLabel: string): { month: string; day: string } | null {
  const match = dateLabel.match(/(\d+)月(\d+)日/);
  if (!match || !match[1] || !match[2]) return null;

  return { month: match[1], day: match[2] };
}

/**
 * 從「X月Y日」標籤推回實際日期。標籤不帶年份，於是在今天的前一年 /
 * 當年 / 隔年三個候選中，取與今天最接近者 —— 跨年時（12 月底看到的
 * 隔年「1月」、1 月初看到的去年「12月」殘列）都能落在正確的一側。
 * 班表只呈現近期日期，三候選中必有唯一明顯最近者，不會模稜兩可。
 * @param monthIndex - 0-11 的月份索引
 * @param day - 日
 */
function resolveLabelDate(monthIndex: number, day: number): Date {
  const today = new Date();
  const todayTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  return [-1, 0, 1]
    .map((offset) => new Date(today.getFullYear() + offset, monthIndex, day))
    .reduce((nearest, candidate) =>
      Math.abs(candidate.getTime() - todayTime) < Math.abs(nearest.getTime() - todayTime)
        ? candidate
        : nearest
    );
}

/**
 * 取得「X月Y日」對應的星期中文字。年份以 resolveLabelDate 的「最近年」
 * 推算，跨年時（12 月底的隔年 1 月、1 月初的去年 12 月）仍正確。
 * @param dateLabel - 日期標籤（格式：10月28日）
 * @returns 星期單字（日～六）；格式不符時回傳空字串
 */
export function getWeekdayLabel(dateLabel: string): string {
  const parsed = parseDateLabel(dateLabel);
  if (!parsed) return '';

  const month = parseInt(parsed.month, 10) - 1;
  const day = parseInt(parsed.day, 10);
  const weekday = resolveLabelDate(month, day).getDay();

  return WEEKDAY_LABELS[weekday] ?? '';
}

/**
 * 檢查日期是否為今天
 */
export function isToday(dateLabel: string): boolean {
  return dateLabel === getTodayLabel();
}

/**
 * 檢查「X月Y日」標籤是否為今天或未來。年份以 resolveLabelDate 的「最近年」
 * 推算，跨年時不會把隔年 1 月誤判為過去、也不會把去年 12 月殘列誤判為未來。
 * @param dateLabel - 日期標籤（格式：10月28日）
 */
export function isTodayOrFuture(dateLabel: string): boolean {
  const parsed = parseDateLabel(dateLabel);
  if (!parsed) return false;

  const month = parseInt(parsed.month, 10) - 1;
  const day = parseInt(parsed.day, 10);

  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetDate = resolveLabelDate(month, day);

  return targetDate >= todayDate;
}
