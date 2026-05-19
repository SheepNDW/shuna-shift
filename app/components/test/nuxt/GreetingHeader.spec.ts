import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import GreetingHeader from '../../GreetingHeader.vue';

// ClientOnly 在測試中直接渲染預設插槽
const ClientOnlyStub = { template: '<div><slot /></div>' };

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
      vi.setSystemTime(new Date(2024, 9, 28, 9, 0, 0));
      const wrapper = await mountSuspended(GreetingHeader, {
        global: { stubs: { ClientOnly: ClientOnlyStub } },
      });

      expect(wrapper.get('.greeting__hello').text()).toContain('おはよう');
      expect(wrapper.get('.greeting__sub').text()).toContain('早安');
    });

    it('下午應顯示「こんにちは」與「午安」', async () => {
      vi.setSystemTime(new Date(2024, 9, 28, 14, 0, 0));
      const wrapper = await mountSuspended(GreetingHeader, {
        global: { stubs: { ClientOnly: ClientOnlyStub } },
      });

      expect(wrapper.get('.greeting__hello').text()).toContain('こんにちは');
      expect(wrapper.get('.greeting__sub').text()).toContain('午安');
    });

    it('晚上應顯示「こんばんは」與「晚安」', async () => {
      vi.setSystemTime(new Date(2024, 9, 28, 20, 0, 0));
      const wrapper = await mountSuspended(GreetingHeader, {
        global: { stubs: { ClientOnly: ClientOnlyStub } },
      });

      expect(wrapper.get('.greeting__hello').text()).toContain('こんばんは');
      expect(wrapper.get('.greeting__sub').text()).toContain('晚安');
    });
  });

  describe('日期框', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date(2024, 9, 28, 9, 0, 0));
    });

    it('應顯示今日的月、日與星期', async () => {
      const wrapper = await mountSuspended(GreetingHeader, {
        global: { stubs: { ClientOnly: ClientOnlyStub } },
      });

      const nums = wrapper.findAll('.greeting__date-num');
      expect(nums[0]?.text()).toBe('10');
      expect(nums[1]?.text()).toBe('28');
      // 2024/10/28 為星期一
      expect(wrapper.get('.greeting__date-dow').text()).toBe('星期一');
    });

    it('有 today 特殊日說明時應顯示說明文字', async () => {
      const wrapper = await mountSuspended(GreetingHeader, {
        props: { today: todayMock },
        global: { stubs: { ClientOnly: ClientOnlyStub } },
      });

      expect(wrapper.get('.greeting__date-desc').text()).toBe('生誕祭');
    });

    it('未提供 today 時不顯示說明文字', async () => {
      const wrapper = await mountSuspended(GreetingHeader, {
        global: { stubs: { ClientOnly: ClientOnlyStub } },
      });

      expect(wrapper.find('.greeting__date-desc').exists()).toBe(false);
    });
  });
});
