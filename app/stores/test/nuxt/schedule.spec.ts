import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useScheduleStore } from '~/stores/schedule';

vi.mock('#app', () => ({
  useFetch: vi.fn(),
}));

describe('useScheduleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('應該初始化空的班表資料', () => {
    const store = useScheduleStore();

    expect(store.schedules).toEqual([]);
  });

  it('應該正確計算今日班表', () => {
    const store = useScheduleStore();
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const todayLabel = `${month}月${day}日`;

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

  it('當沒有今日班表時應該回傳 undefined', () => {
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

    expect(store.todaySchedule).toBeUndefined();
  });

  it('應該處理空班表的情況', () => {
    const store = useScheduleStore();

    expect(store.todaySchedule).toBeUndefined();
  });
});
