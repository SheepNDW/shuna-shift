import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAgent } from '~/composables/useAgent';
import { mockSchedules } from './fixtures/mockSchedules';

vi.mock('~/stores/schedule', () => ({
  useScheduleStore: vi.fn(() => ({
    schedules: mockSchedules,
  })),
}));

describe('useAgent', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('agentInfo', () => {
    it('應該回傳正確的探員資訊', () => {
      const { agentInfo } = useAgent('rin');

      expect(agentInfo.value).toEqual({
        id: 'rin',
        name: '泠泠',
        picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuLy1qse9mYTlDH32ZF0nMIWydusApvaojBGEb',
        instagram: 'https://www.instagram.com/shuna.rin_/',
      });
    });

    it('當探員 ID 不存在時應該回傳 null', () => {
      const { agentInfo } = useAgent('nonexistent');

      expect(agentInfo.value).toBeNull();
    });

    it('應該能正確找到不同的探員', () => {
      const { agentInfo: lunaInfo } = useAgent('luna');
      const { agentInfo: juanoInfo } = useAgent('juano');

      expect(lunaInfo.value?.name).toBe('Luna');
      expect(juanoInfo.value?.name).toBe('米捲');
    });
  });

  describe('agentSchedules', () => {
    it('當探員不存在時應該回傳空陣列', () => {
      const { agentSchedules } = useAgent('nonexistent');

      expect(agentSchedules.value).toEqual([]);
    });

    it('應該篩選出該探員的日班和夜班排班資料', () => {
      const { agentSchedules } = useAgent('rin');

      // 🐷 在 10月30日有日班和夜班
      expect(agentSchedules.value).toHaveLength(1);
      if (agentSchedules.value[0]) {
        expect(agentSchedules.value[0].date.datetime).toBe('10月30日');
        expect(agentSchedules.value[0].dayShifts).toContainEqual({
          name: '🐷',
          textColor: '',
        });
        expect(agentSchedules.value[0].nightShifts).toContainEqual({
          name: '🐷',
          textColor: '',
        });
      }
    });

    it('應該篩選出該探員在多個日期的排班', () => {
      const { agentSchedules } = useAgent('luna');

      // 🌙 在多個日期都有班
      expect(agentSchedules.value.length).toBeGreaterThan(1);

      const dates = agentSchedules.value.map((s) => s.date.datetime);

      expect(dates).toContain('10月30日');
      expect(dates).toContain('10月31日');
      expect(dates).toContain('11月1日');
    });

    it('應該處理探員名稱包含括號的情況', () => {
      const { agentSchedules } = useAgent('akari');

      // 明里在 10月30日（夜班，名字有括號）和 11月7日（日班，名字無括號）都有班
      expect(agentSchedules.value).toHaveLength(2);

      // 檢查 10月30日的夜班有括號的情況
      const scheduleWithBracket = agentSchedules.value.find((s) => s.date.datetime === '10月30日');
      expect(scheduleWithBracket).toBeDefined();
      if (scheduleWithBracket) {
        expect(scheduleWithBracket.nightShifts).toContainEqual({
          name: '明里(棠棠)',
          textColor: '#ff0000',
        });
      }
    });

    it('應該過濾掉沒有該探員的日期', () => {
      const { agentSchedules } = useAgent('rin');

      // 🐷 只在 10月30日 有班，不應該出現其他日期
      expect(agentSchedules.value).toHaveLength(1);
      const dates = agentSchedules.value.map((s) => s.date.datetime);
      expect(dates).not.toContain('10月31日');
      expect(dates).not.toContain('11月1日');
    });

    it('應該過濾掉公休日', () => {
      const { agentSchedules } = useAgent('luna');

      // 不應該包含 11月3日（公休）
      const dates = agentSchedules.value.map((s) => s.date.datetime);
      expect(dates).not.toContain('11月3日');
    });

    it('應該正確處理有特殊背景色的日期', () => {
      const { agentSchedules } = useAgent('non');

      // 音 在 11月9日（音的生日）有班
      const schedule = agentSchedules.value.find((s) => s.date.datetime === '11月9日');
      expect(schedule).toBeDefined();
      if (schedule) {
        expect(schedule.date.backgroundColor).toBe('#d5a6bd');
        expect(schedule.date.description).toBe('音');
      }
    });

    it('應該處理探員在夜班有特殊文字顏色的情況', () => {
      const { agentSchedules } = useAgent('ino');

      // 井野 在 11月1日 夜班有特殊顏色
      const schedule = agentSchedules.value.find((s) => s.date.datetime === '11月1日');
      expect(schedule).toBeDefined();
      if (schedule) {
        expect(schedule.nightShifts).toContainEqual({
          name: '井野',
          textColor: '#93c47d',
        });
      }
    });

    it('應該正確篩選出探員在多個日期的排班', () => {
      const { agentSchedules } = useAgent('juano');

      // 🥨 在多個日期都有班
      expect(agentSchedules.value.length).toBeGreaterThan(5);

      const dates = agentSchedules.value.map((s) => s.date.datetime);
      expect(dates).toContain('10月31日');
      expect(dates).toContain('11月1日');
      expect(dates).toContain('11月2日');
    });
  });
});
