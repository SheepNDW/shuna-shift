import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useSchedules } from '~/composables/useSchedules';

/**
 * 固定在台北的某個時刻。若用 `new Date()` 現算今天的月日當標籤，而 `todaySchedule`
 * 走台北時區的「今天」—— 兩者在機器本地日期與台北不同時（例如 UTC+14 的機器、
 * 或台灣凌晨時段的 UTC runner）就會對不上。
 *
 * 比對的鍵是 ISO 日期（`date.iso`）而非「X月Y日」標籤：標籤不帶年份，
 * 歷史班表跨年累積時同一個標籤會對應兩天。
 */
const TAIPEI_NOON = new Date('2024-10-28T12:00:00+08:00');
const TODAY_ISO = '2024-10-28';

/**
 * `useFetch` 是 Nuxt auto-import，`vi.mock('#app')` 攔不到
 * （composable 用的是 auto-import，不是從 '#app' 具名匯入），必須用 mockNuxtImport。
 */
const { useFetchMock } = vi.hoisted(() => ({ useFetchMock: vi.fn() }));
mockNuxtImport('useFetch', () => useFetchMock);

interface FetchStub {
  schedules?: ShiftSchedule[];
  lastUpdated?: string;
  error?: Error | null;
}

/** 佈置一份 useFetch 的回傳，並交還可在測試中改動的 refs */
function stubFetch({ schedules = [], lastUpdated = '', error = null }: FetchStub = {}) {
  const state = {
    data: ref({ schedules, metadata: { lastUpdated } }),
    error: ref<Error | null>(error),
  };
  useFetchMock.mockReturnValue(state);
  return state;
}

const scheduleAt = (iso: string): ShiftSchedule => ({
  date: { iso, datetime: isoToDateLabel(iso), backgroundColor: '', description: '' },
  day: [{ name: '小春', textColor: '' }],
  night: [],
});

describe('useSchedules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(TAIPEI_NOON);
    stubFetch();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 這個 key 是「全站只打一次 /api/sheet」的唯一保證：footer、首頁、/shifts、
  // 探員頁都靠它接到同一份 asyncData。改掉等於默默恢復成每個呼叫點各一份快取。
  it('應該以固定的 key 共用同一份 asyncData', async () => {
    await useSchedules();

    // 逐一取參數而非 toHaveBeenCalledWith：Nuxt 的 build transform 會在呼叫端補上
    // 第三個參數（自動生成的 key hash），整組比對會被那個實作細節綁死。
    const [url, options] = useFetchMock.mock.calls[0] ?? [];
    expect(url).toBe('/api/sheet');
    expect(options).toMatchObject({ key: 'schedules' });
  });

  it('應該初始化空的班表資料', async () => {
    const { schedules } = await useSchedules();

    expect(schedules.value).toEqual([]);
  });

  it('成功時應該取得班表與 lastUpdated，且 hasError 為 false', async () => {
    stubFetch({
      schedules: [scheduleAt(TODAY_ISO)],
      lastUpdated: '2024-10-28T04:30:00.000Z',
    });

    const { schedules, lastUpdated, hasError } = await useSchedules();

    expect(schedules.value).toHaveLength(1);
    expect(lastUpdated.value).toBe('2024-10-28T04:30:00.000Z');
    expect(hasError.value).toBe(false);
  });

  it('失敗時 hasError 應為 true', async () => {
    stubFetch({ error: new Error('sheets down') });

    const { hasError } = await useSchedules();

    expect(hasError.value).toBe(true);
  });

  describe('todaySchedule', () => {
    it('應該正確計算今日班表', async () => {
      const todayEntry: ShiftSchedule = {
        date: {
          iso: TODAY_ISO,
          datetime: '10月28日',
          backgroundColor: '#b6d7a8',
          description: '',
        },
        day: [{ name: '🐷', textColor: '' }],
        night: [{ name: '🌙', textColor: '' }],
      };
      stubFetch({ schedules: [todayEntry, scheduleAt('2024-01-01')] });

      const { todaySchedule } = await useSchedules();

      expect(todaySchedule.value).toEqual(todayEntry);
    });

    it('當沒有今日班表時應該回傳 null', async () => {
      stubFetch({ schedules: [scheduleAt('2024-01-01')] });

      const { todaySchedule } = await useSchedules();

      expect(todaySchedule.value).toBeNull();
    });

    // 標籤只有月日，去年的同一天標籤與今天完全相同；以 iso 比對才分得開。
    it('去年的同月同日不應被當成今日班表', async () => {
      stubFetch({ schedules: [scheduleAt('2023-10-28')] });

      const { schedules, todaySchedule } = await useSchedules();

      expect(schedules.value[0]?.date.datetime).toBe('10月28日');
      expect(todaySchedule.value).toBeNull();
    });

    it('應該處理空班表的情況', async () => {
      const { todaySchedule } = await useSchedules();

      expect(todaySchedule.value).toBeNull();
    });
  });
});
