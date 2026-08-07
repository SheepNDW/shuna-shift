import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import GreetingHeader from '../../GreetingHeader.vue';

/**
 * 一律用帶位移的絕對時刻。元件的招呼語與日期都來自 app/utils/date.ts，
 * 那邊把「現在」固定在台北時區；fixture 若用 `new Date(2024, 9, 28, 9)`
 * 這種本地建構式，讀的是跑測試的機器時區，兩邊就會對不起來
 * （UTC runner 上的 9 點等於台北 17 點，落到不同的招呼語分桶）。
 */
const MORNING = new Date('2024-10-28T09:00:00+08:00');
const AFTERNOON = new Date('2024-10-28T14:00:00+08:00');
const EVENING = new Date('2024-10-28T20:00:00+08:00');
/** 台北 2024/10/28 01:00 —— 此刻 UTC 仍停在 10/27 */
const TAIPEI_EARLY_MORNING = new Date('2024-10-27T17:00:00Z');

const todayMock: ShiftSchedule = {
  date: {
    datetime: '10月28日',
    backgroundColor: '#d5a6bd',
    description: '生誕祭',
  },
  day: [],
  night: [],
};

describe('GreetingHeader', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('時段招呼語', () => {
    it('早上應顯示「おはよう」與「早安」', async () => {
      vi.setSystemTime(MORNING);
      const wrapper = await mountSuspended(GreetingHeader);

      expect(wrapper.get('[data-testid="greeting-hello"]').text()).toContain('おはよう');
      expect(wrapper.get('[data-testid="greeting-sub"]').text()).toContain('早安');
    });

    it('下午應顯示「こんにちは」與「午安」', async () => {
      vi.setSystemTime(AFTERNOON);
      const wrapper = await mountSuspended(GreetingHeader);

      expect(wrapper.get('[data-testid="greeting-hello"]').text()).toContain('こんにちは');
      expect(wrapper.get('[data-testid="greeting-sub"]').text()).toContain('午安');
    });

    it('晚上應顯示「こんばんは」與「晚安」', async () => {
      vi.setSystemTime(EVENING);
      const wrapper = await mountSuspended(GreetingHeader);

      expect(wrapper.get('[data-testid="greeting-hello"]').text()).toContain('こんばんは');
      expect(wrapper.get('[data-testid="greeting-sub"]').text()).toContain('晚安');
    });

    it('台北凌晨時段（UTC 仍在前一天）應顯示「こんばんは」', async () => {
      vi.setSystemTime(TAIPEI_EARLY_MORNING);
      const wrapper = await mountSuspended(GreetingHeader);

      expect(wrapper.get('[data-testid="greeting-hello"]').text()).toContain('こんばんは');
    });
  });

  describe('日期框', () => {
    beforeEach(() => {
      vi.setSystemTime(MORNING);
    });

    it('應顯示今日的月、日與星期', async () => {
      const wrapper = await mountSuspended(GreetingHeader);

      const nums = wrapper.findAll('[data-testid="greeting-date-num"]');
      expect(nums[0]?.text()).toBe('10');
      expect(nums[1]?.text()).toBe('28');
      // 2024/10/28 為星期一
      expect(wrapper.get('[data-testid="greeting-date-dow"]').text()).toBe('星期一');
    });

    it('台北凌晨時段仍應顯示台北的今日日期', async () => {
      vi.setSystemTime(TAIPEI_EARLY_MORNING);
      const wrapper = await mountSuspended(GreetingHeader);

      const nums = wrapper.findAll('[data-testid="greeting-date-num"]');
      expect(nums[0]?.text()).toBe('10');
      expect(nums[1]?.text()).toBe('28');
    });

    it('有 today 特殊日說明時應顯示說明文字', async () => {
      const wrapper = await mountSuspended(GreetingHeader, {
        props: { today: todayMock },
      });

      expect(wrapper.get('[data-testid="greeting-date-desc"]').text()).toBe('生誕祭');
    });

    it('未提供 today 時不顯示說明文字', async () => {
      const wrapper = await mountSuspended(GreetingHeader);

      expect(wrapper.find('[data-testid="greeting-date-desc"]').exists()).toBe(false);
    });
  });
});
