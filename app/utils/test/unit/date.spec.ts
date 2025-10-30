import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatDateTime,
  getCurrentHour,
  getCurrentYear,
  getTodayLabel,
  isToday,
  isTodayOrFuture,
} from '../../date';

describe('date utils', () => {
  // 測試用的時間常數
  const TEST_DATES = {
    NORMAL_DAY: new Date(2024, 9, 28, 12, 0, 0), // 2024年10月28日 中午12點
    SINGLE_DIGIT: new Date(2024, 0, 5, 12, 0, 0), // 2024年1月5日
    YEAR_END: new Date(2024, 11, 31, 12, 0, 0), // 2024年12月31日
    YEAR_START: new Date(2024, 0, 1, 12, 0, 0), // 2024年1月1日
    MIDNIGHT: new Date(2024, 9, 28, 0, 0, 0), // 午夜0點
    ALMOST_MIDNIGHT: new Date(2024, 9, 28, 23, 59, 59), // 接近午夜
    AFTERNOON: new Date(2024, 9, 28, 14, 30, 0), // 下午2點30分
    MORNING: new Date(2024, 9, 28, 9, 15, 0), // 早上9點15分
    NEXT_YEAR: new Date(2025, 0, 1, 0, 0, 0), // 2025年1月1日
    MONTH_JAN_15: new Date(2024, 0, 15, 12, 0, 0), // 2024年1月15日
  };

  beforeEach(() => {
    // 清除所有 mock
    vi.restoreAllMocks();
  });

  describe('getTodayLabel', () => {
    it('應該回傳正確的月日格式', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      const result = getTodayLabel();
      expect(result).toBe('10月28日');
    });

    it('應該處理單位數月份和日期', () => {
      vi.setSystemTime(TEST_DATES.SINGLE_DIGIT);

      const result = getTodayLabel();
      expect(result).toBe('1月5日');
    });

    it('應該處理年底日期', () => {
      vi.setSystemTime(TEST_DATES.YEAR_END);

      const result = getTodayLabel();
      expect(result).toBe('12月31日');
    });

    it('應該處理年初日期', () => {
      vi.setSystemTime(TEST_DATES.YEAR_START);

      const result = getTodayLabel();
      expect(result).toBe('1月1日');
    });
  });

  describe('formatDateTime', () => {
    it('應該正確格式化 ISO 時間戳', () => {
      const isoString = '2024-10-28T14:30:00.000Z';
      const result = formatDateTime(isoString);

      // 結果會根據系統時區而不同，但應該包含基本元素
      expect(result).toMatch(/2024/);
      expect(result).toMatch(/10/);
      expect(result).toMatch(/28/);
    });

    it('應該處理空字串', () => {
      expect(formatDateTime('')).toBe('');
    });

    it('應該使用自定義 locale', () => {
      const isoString = '2024-10-28T14:30:00.000Z';
      const result = formatDateTime(isoString, 'en-US');

      expect(result).toBeTruthy();
      expect(result).toMatch(/2024/);
    });

    it('應該使用預設 locale (zh-TW)', () => {
      const isoString = '2024-10-28T14:30:00.000Z';
      const result = formatDateTime(isoString);

      // zh-TW 格式通常包含年月日
      expect(result).toBeTruthy();
      expect(result).toMatch(/2024/);
    });

    it('應該包含時間資訊', () => {
      const isoString = '2024-10-28T14:30:00.000Z';
      const result = formatDateTime(isoString);

      // 應該包含小時和分鐘（格式可能因時區而異）
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('getCurrentYear', () => {
    it('應該回傳當前年份', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      const result = getCurrentYear();
      expect(result).toBe(2024);
    });

    it('應該回傳正確的年份（不同年份）', () => {
      vi.setSystemTime(TEST_DATES.NEXT_YEAR);

      const result = getCurrentYear();
      expect(result).toBe(2025);
    });

    it('應該回傳數字型別', () => {
      const result = getCurrentYear();
      expect(typeof result).toBe('number');
    });
  });

  describe('getCurrentHour', () => {
    it('應該回傳當前小時（24小時制）', () => {
      vi.setSystemTime(TEST_DATES.AFTERNOON);

      const result = getCurrentHour();
      expect(result).toBe(14);
    });

    it('應該回傳午夜小時', () => {
      vi.setSystemTime(TEST_DATES.MIDNIGHT);

      const result = getCurrentHour();
      expect(result).toBe(0);
    });

    it('應該回傳晚上 11 點', () => {
      vi.setSystemTime(TEST_DATES.ALMOST_MIDNIGHT);

      const result = getCurrentHour();
      expect(result).toBe(23);
    });

    it('應該回傳早上時段', () => {
      vi.setSystemTime(TEST_DATES.MORNING);

      const result = getCurrentHour();
      expect(result).toBe(9);
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
      vi.setSystemTime(TEST_DATES.NORMAL_DAY); // 2024年10月28日

      expect(isTodayOrFuture('10月28日')).toBe(true);
    });

    it('應該判斷未來的日期為 true', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY); // 2024年10月28日

      expect(isTodayOrFuture('10月29日')).toBe(true);
      expect(isTodayOrFuture('10月30日')).toBe(true);
      expect(isTodayOrFuture('11月1日')).toBe(true);
      expect(isTodayOrFuture('12月31日')).toBe(true);
    });

    it('應該判斷過去的日期為 false', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY); // 2024年10月28日

      expect(isTodayOrFuture('10月27日')).toBe(false);
      expect(isTodayOrFuture('10月1日')).toBe(false);
      expect(isTodayOrFuture('9月30日')).toBe(false);
      expect(isTodayOrFuture('1月1日')).toBe(false);
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
      vi.setSystemTime(TEST_DATES.MIDNIGHT); // 2024年10月28日 00:00:00

      expect(isTodayOrFuture('10月28日')).toBe(true);
      expect(isTodayOrFuture('10月27日')).toBe(false);
    });

    it('應該在接近午夜時正確判斷', () => {
      vi.setSystemTime(TEST_DATES.ALMOST_MIDNIGHT); // 2024年10月28日 23:59:59

      expect(isTodayOrFuture('10月28日')).toBe(true);
      expect(isTodayOrFuture('10月29日')).toBe(true);
      expect(isTodayOrFuture('10月27日')).toBe(false);
    });

    it('應該處理跨年情況', () => {
      vi.setSystemTime(TEST_DATES.YEAR_END); // 2024年12月31日

      expect(isTodayOrFuture('12月31日')).toBe(true);
      // 注意：因為我們只比較月日，所以 1月1日 會被視為過去（去年的 1月1日）
      expect(isTodayOrFuture('1月1日')).toBe(false);
      expect(isTodayOrFuture('12月30日')).toBe(false);
    });

    it('應該處理月份邊界', () => {
      vi.setSystemTime(new Date(2024, 9, 1, 12, 0, 0)); // 2024年10月1日

      expect(isTodayOrFuture('10月1日')).toBe(true);
      expect(isTodayOrFuture('10月2日')).toBe(true);
      expect(isTodayOrFuture('9月30日')).toBe(false);
    });
  });

  describe('邊界情況測試', () => {
    it('getTodayLabel 應該在午夜正確工作', () => {
      vi.setSystemTime(TEST_DATES.MIDNIGHT);

      const result = getTodayLabel();
      expect(result).toBe('10月28日');
    });

    it('getTodayLabel 應該在接近午夜時正確工作', () => {
      vi.setSystemTime(TEST_DATES.ALMOST_MIDNIGHT);

      const result = getTodayLabel();
      expect(result).toBe('10月28日');
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

  describe('整合測試', () => {
    it('getTodayLabel 和 isToday 應該保持一致', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      const today = getTodayLabel();
      expect(isToday(today)).toBe(true);
    });

    it('getCurrentYear 應該與 Date 物件一致', () => {
      vi.setSystemTime(TEST_DATES.NORMAL_DAY);

      const year = getCurrentYear();
      expect(year).toBe(new Date().getFullYear());
    });

    it('getCurrentHour 應該與 Date 物件一致', () => {
      vi.setSystemTime(TEST_DATES.AFTERNOON);

      const hour = getCurrentHour();
      expect(hour).toBe(new Date().getHours());
    });
  });
});
