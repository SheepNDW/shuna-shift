/**
 * 全站的「現在」一律以台北時區判定。
 *
 * 不固定時區的話，SSR 與瀏覽器會對「今天」有不同答案：server 通常跑 UTC
 * （本專案部署在 Vercel functions，即是如此），而使用者在 UTC+8，於是每天台灣
 * 時間 00:00–08:00 這 8 小時內 server 算出來的日期比使用者早一天；依小時分桶的
 * 招呼語更是全天都可能不同。首頁與班表頁原本整頁包在 `<ClientOnly>` 就是在遮
 * 這個症狀（代價是放棄 SSR）。顯式指定時區後 server / client 必然一致，
 * `ClientOnly` 才能拿掉。
 *
 * 用 `Intl` 顯式指定而不是靠 `TZ=Asia/Taipei` 環境變數：前者不依賴部署環境設定，
 * 測試也能在任何機器的時區下跑出相同結果。
 */
const TIME_ZONE = 'Asia/Taipei';

/** 台北時區的日期時間欄位 */
interface TaipeiParts {
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
function getTaipeiParts(date: Date = new Date()): TaipeiParts {
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

/** `TaipeiParts.month` 是 1-12，`Date` 的月份參數則是 0-11 */
const toMonthIndex = (month: number): number => month - 1;

/**
 * 由台北時區的年月日建一個「只用來比大小」的 Date。
 *
 * 固定用 UTC 正午而非 00:00，是為了讓日期比較不會被任何時區位移推到前後一天。
 * 這種 Date 的時分秒沒有意義，只有日期部分可用，故一律以 `getUTC*` 讀取。
 */
function toComparableDate(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day, 12));
}

/** 把一組台北年月日轉成可比較的 Date */
function toComparable({ year, month, day }: TaipeiParts): Date {
  return toComparableDate(year, toMonthIndex(month), day);
}

const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * 取得當前日期的月日格式（如：10月28日）
 */
export function getTodayLabel(): string {
  const { month, day } = getTaipeiParts();
  return `${month}月${day}日`;
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
 * 取得當前年份
 */
export function getCurrentYear(): number {
  return getTaipeiParts().year;
}

/**
 * 取得當前小時（24小時制）
 */
export function getCurrentHour(): number {
  return getTaipeiParts().hour;
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
 * @param today - 台北的今天；由呼叫端傳入以免同一次判斷讀到兩個不同的「現在」
 */
function resolveLabelDate(
  monthIndex: number,
  day: number,
  today: TaipeiParts = getTaipeiParts()
): Date {
  const todayTime = toComparable(today).getTime();

  return [-1, 0, 1]
    .map((offset) => toComparableDate(today.year + offset, monthIndex, day))
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
  const weekday = resolveLabelDate(month, day).getUTCDay();

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

  // 只讀一次「現在」，比較的兩邊必然基於同一瞬間
  const today = getTaipeiParts();
  return resolveLabelDate(month, day, today) >= toComparable(today);
}
