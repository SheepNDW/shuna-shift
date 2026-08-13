import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addMonthsToIso,
  getTaipeiParts,
  getTodayIso,
  isIsoDate,
  isoToDateLabel,
  isoToUtcDate,
  toIsoDate,
} from '../utils/date';

/**
 * 一律用帶位移的絕對時刻，不用 `new Date(2024, 9, 28)` 這種本地建構式 ——
 * 本地建構式的「本地」會跟著跑測試的機器變動，實作讀台北、fixture 卻讀機器時區，
 * 在非台北的機器（例如 CI 的 UTC）上就會對不起來。
 */
afterEach(() => {
  vi.useRealTimers();
});

describe('isIsoDate', () => {
  it('應接受 yyyy-mm-dd', () => {
    expect(isIsoDate('2026-08-31')).toBe(true);
    expect(isIsoDate('2026-01-05')).toBe(true);
  });

  it('應拒絕顯示標籤、未補零與空字串', () => {
    expect(isIsoDate('8月31日')).toBe(false);
    expect(isIsoDate('2026-1-5')).toBe(false);
    expect(isIsoDate('2026/08/31')).toBe(false);
    expect(isIsoDate('')).toBe(false);
  });

  // 刻意只驗格式：日期一律由 Excel 序號產生，不存在的日曆日進不來。
  // 唯一的外部輸入是 /shifts 的 ?date=，那個值只當 getElementById 的 key（字面比對）。
  // 這支測試是要讓「格式合法但日曆不存在」的後果留在明處，而不是等到有人踩到。
  it('只驗格式，不驗該日期是否真的存在', () => {
    expect(isIsoDate('2026-02-31')).toBe(true);
    expect(isIsoDate('2026-13-01')).toBe(true);

    // 後果：這種值會被 Date 靜默滾到隔月，而不是回 null
    expect(isoToUtcDate('2026-02-31')?.toISOString()).toBe('2026-03-03T12:00:00.000Z');
  });
});

describe('toIsoDate', () => {
  it('應把月與日補零為固定寬度', () => {
    expect(toIsoDate(2026, 1, 5)).toBe('2026-01-05');
    expect(toIsoDate(2026, 12, 31)).toBe('2026-12-31');
  });
});

describe('getTodayIso', () => {
  it('應回傳台北時區的今天', () => {
    vi.setSystemTime(new Date('2026-08-13T12:00:00+08:00'));

    expect(getTodayIso()).toBe('2026-08-13');
  });

  // server（UTC）與 client（UTC+8）必須對「今天」同答案：台灣 00:00–08:00 這
  // 8 小時，UTC 還停在前一天。
  it('台北已跨日、UTC 仍在前一天時，應以台北日期為準', () => {
    vi.setSystemTime(new Date('2026-08-12T16:30:00Z')); // 台北 2026/08/13 00:30

    expect(getTodayIso()).toBe('2026-08-13');
  });

  it('跨年夜：台北已進新年、UTC 仍在舊年', () => {
    vi.setSystemTime(new Date('2025-12-31T16:00:00Z')); // 台北 2026/01/01 00:00

    expect(getTodayIso()).toBe('2026-01-01');
  });
});

describe('getTaipeiParts', () => {
  it('應取出台北時區的年月日時分', () => {
    const parts = getTaipeiParts(new Date('2026-08-12T16:30:00Z'));

    expect(parts).toEqual({ year: 2026, month: 8, day: 13, hour: 0, minute: 30 });
  });

  it('月份為 1-12（非 0-based）', () => {
    expect(getTaipeiParts(new Date('2026-01-15T12:00:00+08:00')).month).toBe(1);
  });
});

describe('isoToUtcDate', () => {
  it('應落在 UTC 正午，避免時區位移把日期推到前後一天', () => {
    const date = isoToUtcDate('2026-08-31');

    expect(date?.toISOString()).toBe('2026-08-31T12:00:00.000Z');
  });

  it('格式不符時回傳 null', () => {
    expect(isoToUtcDate('8月31日')).toBeNull();
    expect(isoToUtcDate('')).toBeNull();
  });
});

describe('isoToDateLabel', () => {
  it('應轉為「X月Y日」且不補零', () => {
    expect(isoToDateLabel('2026-08-31')).toBe('8月31日');
    expect(isoToDateLabel('2026-01-05')).toBe('1月5日');
  });

  it('相隔一年的同月同日會得到相同標籤 —— 標籤不可用於比較', () => {
    expect(isoToDateLabel('2026-01-05')).toBe(isoToDateLabel('2027-01-05'));
  });

  it('格式不符時回傳空字串', () => {
    expect(isoToDateLabel('')).toBe('');
    expect(isoToDateLabel('8月31日')).toBe('');
  });
});

describe('addMonthsToIso', () => {
  it('應往回推 N 個月', () => {
    expect(addMonthsToIso('2026-08-13', -3)).toBe('2026-05-13');
  });

  it('應正確跨年', () => {
    expect(addMonthsToIso('2026-01-15', -3)).toBe('2025-10-15');
    expect(addMonthsToIso('2025-12-01', 2)).toBe('2026-02-01');
  });

  it('月底往回推時沿用 Date 的溢位正規化', () => {
    // 2026-02-31 不存在 → 正規化為 3 月 3 日（2026 非閏年）
    expect(addMonthsToIso('2026-05-31', -3)).toBe('2026-03-03');
  });

  it('格式不符時回傳空字串', () => {
    expect(addMonthsToIso('12月16日', -3)).toBe('');
  });
});

describe('ISO 日期可直接做字串比較', () => {
  it('字典序等於時間序（含跨年）', () => {
    expect('2026-01-05' < '2027-01-05').toBe(true);
    expect('2025-12-31' < '2026-01-01').toBe(true);
    expect('2026-08-09' < '2026-08-10').toBe(true);
  });
});
