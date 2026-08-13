import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useScheduleStore } from '~/stores/schedule';

/**
 * 固定在台北的某個時刻。原本這支測試用 `new Date()` 現算今天的月日當標籤，
 * 而 store 的 todaySchedule 走台北時區的「今天」—— 兩者在機器本地日期與台北不同時
 * （例如 UTC+14 的機器、或台灣凌晨時段的 UTC runner）就會對不上。
 * 之所以一直沒紅，只是因為多數時候兩邊剛好同一天。
 *
 * 比對的鍵是 ISO 日期（`date.iso`）而非「X月Y日」標籤：標籤不帶年份，
 * 歷史班表跨年累積時同一個標籤會對應兩天。
 */
const TAIPEI_NOON = new Date('2024-10-28T12:00:00+08:00');
const TODAY_ISO = '2024-10-28';

/**
 * `useFetch` 是 Nuxt auto-import，`vi.mock('#app')` 攔不到
 * （store 用的是 auto-import，不是從 '#app' 具名匯入），必須用 mockNuxtImport。
 * 攔下來才有辦法驅動 fetchSchedules 的成功／失敗兩條路。
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
    status: ref('idle'),
    execute: vi.fn(async () => {}),
  };
  useFetchMock.mockReturnValue(state);
  return state;
}

const scheduleAt = (iso: string): ShiftSchedule => ({
  date: { iso, datetime: isoToDateLabel(iso), backgroundColor: '', description: '' },
  day: [{ name: '小春', textColor: '' }],
  night: [],
});

describe('useScheduleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.setSystemTime(TAIPEI_NOON);
    stubFetch();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('應該初始化空的班表資料', () => {
    const store = useScheduleStore();

    expect(store.schedules).toEqual([]);
  });

  it('應該正確計算今日班表', () => {
    const store = useScheduleStore();

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

    store.schedules = [todayEntry, scheduleAt('2024-01-01')];

    expect(store.todaySchedule).toEqual(todayEntry);
  });

  it('當沒有今日班表時應該回傳 null', () => {
    const store = useScheduleStore();

    store.schedules = [scheduleAt('2024-01-01')];

    expect(store.todaySchedule).toBeNull();
  });

  // 標籤只有月日，去年的同一天標籤與今天完全相同；以 iso 比對才分得開。
  it('去年的同月同日不應被當成今日班表', () => {
    const store = useScheduleStore();

    store.schedules = [scheduleAt('2023-10-28')];

    expect(store.schedules[0]?.date.datetime).toBe('10月28日');
    expect(store.todaySchedule).toBeNull();
  });

  it('應該處理空班表的情況', () => {
    const store = useScheduleStore();

    expect(store.todaySchedule).toBeNull();
  });

  describe('fetchSchedules', () => {
    it('成功時應該寫入班表與 lastUpdated，且 hasError 為 false', async () => {
      stubFetch({
        schedules: [scheduleAt(TODAY_ISO)],
        lastUpdated: '2024-10-28T04:30:00.000Z',
      });
      const store = useScheduleStore();

      await store.fetchSchedules();

      expect(store.schedules).toHaveLength(1);
      expect(store.lastUpdated).toBe('2024-10-28T04:30:00.000Z');
      expect(store.hasError).toBe(false);
    });

    it('失敗時應該把 hasError 設為 true', async () => {
      stubFetch({ error: new Error('sheets down') });
      const store = useScheduleStore();

      await store.fetchSchedules();

      expect(store.hasError).toBe(true);
    });

    it('失敗時不應該用空資料覆蓋既有班表', async () => {
      const state = stubFetch({
        schedules: [scheduleAt(TODAY_ISO)],
        lastUpdated: '2024-10-28T04:30:00.000Z',
      });
      const store = useScheduleStore();
      await store.fetchSchedules();

      // 之後的重新整理失敗：data 退回 default 的空資料，但既有班表要留著
      state.data.value = { schedules: [], metadata: { lastUpdated: '' } };
      state.error.value = new Error('sheets down');
      await store.fetchSchedules({ refresh: true });

      expect(store.hasError).toBe(true);
      expect(store.schedules).toHaveLength(1);
      expect(store.lastUpdated).toBe('2024-10-28T04:30:00.000Z');
    });

    it('失敗後再次成功應該把 hasError 歸位', async () => {
      const state = stubFetch({ error: new Error('sheets down') });
      const store = useScheduleStore();
      await store.fetchSchedules();
      expect(store.hasError).toBe(true);

      state.error.value = null;
      state.data.value = {
        schedules: [scheduleAt(TODAY_ISO)],
        metadata: { lastUpdated: '2024-10-28T04:30:00.000Z' },
      };
      await store.fetchSchedules({ refresh: true });

      expect(store.hasError).toBe(false);
      expect(store.schedules).toHaveLength(1);
    });
  });

  describe('hasError', () => {
    it('初始應為 false', () => {
      const store = useScheduleStore();

      expect(store.hasError).toBe(false);
    });
  });
});
