import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatDateTime,
  getCurrentHour,
  getCurrentYear,
  getTodayLabel,
  getWeekdayLabel,
  isToday,
  isTodayOrFuture,
  parseDateLabel,
} from '../../date';

describe('date utils', () => {
  /**
   * 一律用帶位移的絕對時刻，不用 `new Date(2024, 9, 28)` 這種本地建構式。
   *
   * 本地建構式的「本地」會跟著跑測試的機器變動：實作讀台北、fixture 卻讀機器時區，
   * 在非台北的機器（例如 CI 的 UTC）上就會對不起來。寫成 `+08:00` 之後，fixture
   * 的語意固定是「台北的那個時刻」，在任何時區跑都一樣。
   */
  const TEST_DATES = {
    NORMAL_DAY: new Date('2024-10-28T12:00:00+08:00'), // 台北 2024/10/28 12:00
    SINGLE_DIGIT: new Date('2024-01-05T12:00:00+08:00'),
    YEAR_END: new Date('2024-12-31T12:00:00+08:00'),
    YEAR_START: new Date('2024-01-01T12:00:00+08:00'),
    MIDNIGHT: new Date('2024-10-28T00:00:00+08:00'),
    ALMOST_MIDNIGHT: new Date('2024-10-28T23:59:59+08:00'),
    AFTERNOON: new Date('2024-10-28T14:30:00+08:00'),
    MORNING: new Date('2024-10-28T09:15:00+08:00'),
    NEXT_YEAR: new Date('2025-01-01T00:00:00+08:00'),
    MONTH_JAN_15: new Date('2024-01-15T12:00:00+08:00'),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getTodayLabel', () => {
    it('應該回傳正確的月日格式', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      expect(getTodayLabel()).toBe('10月28日');
    });

    it('應該處理單位數月份和日期', () => {
      vi.setSystemTime(TEST_DATES.SINGLE_DIGIT);

      expect(getTodayLabel()).toBe('1月5日');
    });

    it('應該處理年底日期', () => {
      vi.setSystemTime(TEST_DATES.YEAR_END);

      expect(getTodayLabel()).toBe('12月31日');
    });

    it('應該處理年初日期', () => {
      vi.setSystemTime(TEST_DATES.YEAR_START);

      expect(getTodayLabel()).toBe('1月1日');
    });
  });

  describe('formatDateTime', () => {
    it('應該以台北時區格式化 ISO 時間戳', () => {
      // UTC 14:30 → 台北 22:30
      expect(formatDateTime('2024-10-28T14:30:00.000Z')).toBe('2024/10/28 下午10:30');
    });

    it('應該處理空字串', () => {
      expect(formatDateTime('')).toBe('');
    });

    it('應該對無效的時間字串回傳空字串', () => {
      expect(formatDateTime('not-a-date')).toBe('');
    });

    it('應該回傳固定格式 yyyy/mm/dd 上午|下午hh:mm', () => {
      expect(formatDateTime('2024-10-28T14:30:00+08:00')).toMatch(
        /^2024\/10\/28 (上午|下午)\d{2}:\d{2}$/
      );
    });

    it('應該正確區分上午與下午', () => {
      expect(formatDateTime('2024-10-28T09:05:00+08:00')).toBe('2024/10/28 上午09:05');
      expect(formatDateTime('2024-10-28T14:30:00+08:00')).toBe('2024/10/28 下午02:30');
    });

    it('應該把午夜與正午分別呈現為 上午12 與 下午12', () => {
      expect(formatDateTime('2024-10-28T00:00:00+08:00')).toBe('2024/10/28 上午12:00');
      expect(formatDateTime('2024-10-28T12:00:00+08:00')).toBe('2024/10/28 下午12:00');
    });

    it('跨日：UTC 當日深夜對應台北隔日凌晨', () => {
      // UTC 2024/10/28 17:00 → 台北 2024/10/29 01:00
      expect(formatDateTime('2024-10-28T17:00:00.000Z')).toBe('2024/10/29 上午01:00');
    });
  });

  describe('getCurrentYear', () => {
    it('應該回傳當前年份', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      expect(getCurrentYear()).toBe(2024);
    });

    it('應該回傳正確的年份（不同年份）', () => {
      vi.setSystemTime(TEST_DATES.NEXT_YEAR);

      expect(getCurrentYear()).toBe(2025);
    });

    it('應該回傳數字型別', () => {
      expect(typeof getCurrentYear()).toBe('number');
    });
  });

  describe('getCurrentHour', () => {
    it('應該回傳當前小時（24小時制）', () => {
      vi.setSystemTime(TEST_DATES.AFTERNOON);

      expect(getCurrentHour()).toBe(14);
    });

    it('應該回傳午夜小時', () => {
      vi.setSystemTime(TEST_DATES.MIDNIGHT);

      expect(getCurrentHour()).toBe(0);
    });

    it('應該回傳晚上 11 點', () => {
      vi.setSystemTime(TEST_DATES.ALMOST_MIDNIGHT);

      expect(getCurrentHour()).toBe(23);
    });

    it('應該回傳早上時段', () => {
      vi.setSystemTime(TEST_DATES.MORNING);

      expect(getCurrentHour()).toBe(9);
    });

    it('應該回傳 0-23 之間的數字', () => {
      const result = getCurrentHour();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(24);
    });
  });

  describe('isToday', () => {
    it('應該正確判斷是否為今天', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      expect(isToday('10月28日')).toBe(true);
    });

    it('應該正確判斷不是今天', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      expect(isToday('10月27日')).toBe(false);
      expect(isToday('10月29日')).toBe(false);
      expect(isToday('11月28日')).toBe(false);
    });

    it('應該處理不同月份', () => {
      vi.setSystemTime(TEST_DATES.MONTH_JAN_15);

      expect(isToday('1月15日')).toBe(true);
      expect(isToday('2月15日')).toBe(false);
    });

    it('應該處理格式不符的日期標籤', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      expect(isToday('2024-10-28')).toBe(false);
      expect(isToday('October 28')).toBe(false);
      expect(isToday('')).toBe(false);
    });

    it('應該處理跨年情況', () => {
      vi.setSystemTime(TEST_DATES.YEAR_END);

      expect(isToday('12月31日')).toBe(true);
      expect(isToday('1月1日')).toBe(false);
    });
  });

  describe('isTodayOrFuture', () => {
    it('應該判斷今天的日期為 true', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      expect(isTodayOrFuture('10月28日')).toBe(true);
    });

    it('應該判斷未來的日期為 true', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      expect(isTodayOrFuture('10月29日')).toBe(true);
      expect(isTodayOrFuture('10月30日')).toBe(true);
      expect(isTodayOrFuture('11月1日')).toBe(true);
      expect(isTodayOrFuture('12月31日')).toBe(true);
    });

    it('應該判斷過去的日期為 false', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      expect(isTodayOrFuture('10月27日')).toBe(false);
      expect(isTodayOrFuture('10月1日')).toBe(false);
      expect(isTodayOrFuture('9月30日')).toBe(false);
    });

    it('應該處理空字串', () => {
      expect(isTodayOrFuture('')).toBe(false);
    });

    it('應該處理格式不符的日期標籤', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      expect(isTodayOrFuture('2024-10-28')).toBe(false);
      expect(isTodayOrFuture('October 28')).toBe(false);
      expect(isTodayOrFuture('28/10')).toBe(false);
    });

    it('應該在午夜時正確判斷', () => {
      vi.setSystemTime(TEST_DATES.MIDNIGHT);

      expect(isTodayOrFuture('10月28日')).toBe(true);
      expect(isTodayOrFuture('10月27日')).toBe(false);
    });

    it('應該在接近午夜時正確判斷', () => {
      vi.setSystemTime(TEST_DATES.ALMOST_MIDNIGHT);

      expect(isTodayOrFuture('10月28日')).toBe(true);
      expect(isTodayOrFuture('10月29日')).toBe(true);
      expect(isTodayOrFuture('10月27日')).toBe(false);
    });

    it('跨年：12 月底看到的隔年 1 月應判為未來', () => {
      vi.setSystemTime(TEST_DATES.YEAR_END);

      expect(isTodayOrFuture('12月31日')).toBe(true);
      expect(isTodayOrFuture('1月1日')).toBe(true);
      expect(isTodayOrFuture('12月30日')).toBe(false);
    });

    it('跨年：1 月初看到去年 12 月殘列應判為過去', () => {
      vi.setSystemTime(new Date('2025-01-03T12:00:00+08:00'));

      expect(isTodayOrFuture('1月3日')).toBe(true);
      expect(isTodayOrFuture('1月5日')).toBe(true);
      expect(isTodayOrFuture('12月20日')).toBe(false);
    });

    it('應該處理月份邊界', () => {
      vi.setSystemTime(new Date('2024-10-01T12:00:00+08:00'));

      expect(isTodayOrFuture('10月1日')).toBe(true);
      expect(isTodayOrFuture('10月2日')).toBe(true);
      expect(isTodayOrFuture('9月30日')).toBe(false);
    });
  });

  /**
   * issue #33 的核心：server（UTC）與 client（UTC+8）必須對「今天」有相同答案。
   *
   * 台灣時間 00:00–08:00 這 8 小時，UTC 還停在前一天 —— 修正前這段時間 SSR 與
   * client 會算出不同日期，也正是首頁被整頁包進 ClientOnly 的原因。
   */
  describe('時區固定於台北', () => {
    it('台北已跨日、UTC 仍在前一天時，應以台北日期為準', () => {
      vi.setSystemTime(new Date('2026-01-15T16:30:00Z')); // 台北 2026/01/16 00:30

      expect(getTodayLabel()).toBe('1月16日');
      expect(getCurrentHour()).toBe(0);
      expect(getCurrentYear()).toBe(2026);
    });

    it('跨年夜：台北已進新年、UTC 仍在舊年', () => {
      vi.setSystemTime(new Date('2025-12-31T16:00:00Z')); // 台北 2026/01/01 00:00

      expect(getTodayLabel()).toBe('1月1日');
      expect(getCurrentYear()).toBe(2026);
      expect(isToday('1月1日')).toBe(true);
      expect(isTodayOrFuture('12月31日')).toBe(false);
    });

    it('台灣 00:00–07:00 的每個整點都應落在台北的同一天', () => {
      // UTC 前一日 16:00–23:00 ⇔ 台北當日 00:00–07:00
      for (let utcHour = 16; utcHour < 24; utcHour += 1) {
        vi.setSystemTime(new Date(`2026-03-09T${String(utcHour).padStart(2, '0')}:00:00Z`));

        expect(getTodayLabel()).toBe('3月10日');
        expect(getCurrentHour()).toBe(utcHour - 16);
        expect(isToday('3月10日')).toBe(true);
        expect(isTodayOrFuture('3月9日')).toBe(false);
      }
    });

    it('台灣 08:00 之後與 UTC 同日，行為不變', () => {
      vi.setSystemTime(new Date('2026-03-10T02:00:00Z')); // 台北 2026/03/10 10:00

      expect(getTodayLabel()).toBe('3月10日');
      expect(getCurrentHour()).toBe(10);
    });
  });

  describe('邊界情況測試', () => {
    it('getTodayLabel 應該在午夜正確工作', () => {
      vi.setSystemTime(TEST_DATES.MIDNIGHT);

      expect(getTodayLabel()).toBe('10月28日');
    });

    it('getTodayLabel 應該在接近午夜時正確工作', () => {
      vi.setSystemTime(TEST_DATES.ALMOST_MIDNIGHT);

      expect(getTodayLabel()).toBe('10月28日');
    });

    it('formatDateTime 應該處理各種 ISO 格式', () => {
      const formats = [
        '2024-10-28T14:30:00Z',
        '2024-10-28T14:30:00.000Z',
        '2024-10-28T14:30:00+08:00',
      ];

      formats.forEach((format) => {
        const result = formatDateTime(format);
        expect(result).toBeTruthy();
        expect(result).toMatch(/2024/);
      });
    });
  });

  describe('parseDateLabel', () => {
    it('應該解析「X月Y日」格式並取出月與日', () => {
      expect(parseDateLabel('10月28日')).toEqual({ month: '10', day: '28' });
    });

    it('應該保留單位數的月與日（不補零）', () => {
      expect(parseDateLabel('5月3日')).toEqual({ month: '5', day: '3' });
    });

    it('應該對格式不符的字串回傳 null', () => {
      expect(parseDateLabel('2024-10-28')).toBeNull();
      expect(parseDateLabel('October 28')).toBeNull();
      expect(parseDateLabel('')).toBeNull();
    });
  });

  describe('getWeekdayLabel', () => {
    it('應該回傳「X月Y日」對應的星期中文字', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      // 2024/10/28 為星期一
      expect(getWeekdayLabel('10月28日')).toBe('一');
    });

    it('應該對格式不符的字串回傳空字串', () => {
      expect(getWeekdayLabel('2024-10-28')).toBe('');
      expect(getWeekdayLabel('')).toBe('');
    });

    it('跨年：12 月底看到的隔年 1 月應以隔年推算星期', () => {
      vi.setSystemTime(TEST_DATES.YEAR_END);

      // 最接近今天的「1月」是隔年 → 2025/1/1 為星期三
      expect(getWeekdayLabel('1月1日')).toBe('三');
      // 最接近今天的「12月31日」是當年 → 2024/12/31 為星期二
      expect(getWeekdayLabel('12月31日')).toBe('二');
    });

    it('跨年：1 月初看到去年 12 月應以去年推算星期', () => {
      vi.setSystemTime(new Date('2025-01-03T12:00:00+08:00'));

      // 最接近今天的「12月」是去年 → 2024/12/20 為星期五
      expect(getWeekdayLabel('12月20日')).toBe('五');
    });

    it('台北凌晨時段仍以台北日期推算星期', () => {
      vi.setSystemTime(new Date('2024-10-27T16:30:00Z')); // 台北 2024/10/28 00:30

      expect(getWeekdayLabel('10月28日')).toBe('一');
    });
  });

  describe('整合測試', () => {
    it('getTodayLabel 和 isToday 應該保持一致', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      expect(isToday(getTodayLabel())).toBe(true);
    });

    it('getCurrentYear 應該回傳台北時區的年份', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      expect(getCurrentYear()).toBe(2024);
    });

    it('getCurrentHour 應該回傳台北時區的小時', () => {
      vi.setSystemTime(TEST_DATES.AFTERNOON);

      expect(getCurrentHour()).toBe(14);
    });
  });
});
