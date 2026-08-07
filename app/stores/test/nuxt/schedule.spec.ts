import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScheduleStore } from '~/stores/schedule';

/**
 * 固定在台北的某個時刻。原本這支測試用 `new Date()` 現算今天的月日當標籤，
 * 而 store 的 todaySchedule 走 getTodayLabel()（台北時區）—— 兩者在機器本地日期
 * 與台北不同時（例如 UTC+14 的機器、或台灣凌晨時段的 UTC runner）就會對不上。
 * 之所以一直沒紅，只是因為多數時候兩邊剛好同一天。
 */
const TAIPEI_NOON = new Date('2024-10-28T12:00:00+08:00');
const TODAY_LABEL = '10月28日';

vi.mock('#app', async (importOriginal) => {
  const actual = await importOriginal<typeof import('#app')>();
  return {
    ...actual,
    useFetch: vi.fn(),
  };
});

describe('useScheduleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.setSystemTime(TAIPEI_NOON);
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
    const todayLabel = TODAY_LABEL;

    store.schedules = [
      {
        date: {
          datetime: todayLabel,
          backgroundColor: '#b6d7a8',
          description: '',
        },
        day: [{ name: '🐷', textColor: '' }],
        night: [{ name: '🌙', textColor: '' }],
      },
      {
        date: {
          datetime: '1月1日',
          backgroundColor: '',
          description: '',
        },
        day: [{ name: '小春', textColor: '' }],
        night: [],
      },
    ];

    expect(store.todaySchedule).toEqual({
      date: {
        datetime: todayLabel,
        backgroundColor: '#b6d7a8',
        description: '',
      },
      day: [{ name: '🐷', textColor: '' }],
      night: [{ name: '🌙', textColor: '' }],
    });
  });

  it('當沒有今日班表時應該回傳 null', () => {
    const store = useScheduleStore();

    store.schedules = [
      {
        date: {
          datetime: '1月1日',
          backgroundColor: '',
          description: '',
        },
        day: [{ name: '小春', textColor: '' }],
        night: [],
      },
    ];

    expect(store.todaySchedule).toBeNull();
  });

  it('應該處理空班表的情況', () => {
    const store = useScheduleStore();

    expect(store.todaySchedule).toBeNull();
  });

  describe('hasError', () => {
    it('初始應為 false', () => {
      const store = useScheduleStore();

      expect(store.hasError).toBe(false);
    });

    it('應與「今日無排班」可區分：有錯誤時 todaySchedule 仍為 null，但 hasError 為 true', () => {
      const store = useScheduleStore();
      store.hasError = true;

      // 兩者同時成立才代表「拿不到資料」，頁面才能渲染錯誤狀態而非空狀態
      expect(store.todaySchedule).toBeNull();
      expect(store.hasError).toBe(true);
    });
  });
});
