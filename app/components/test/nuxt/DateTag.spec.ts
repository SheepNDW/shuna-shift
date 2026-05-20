import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DateTag from '../../DateTag.vue';

describe('DateTag', () => {
  beforeEach(() => {
    // 固定年份，使 getWeekdayLabel 推算結果可預期
    vi.setSystemTime(new Date(2024, 9, 12));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('應解析並顯示月與日', async () => {
    const wrapper = await mountSuspended(DateTag, {
      props: { datetime: '10月12日' },
    });

    expect(wrapper.get('[data-testid="date-tag-month"]').text()).toBe('10');
    expect(wrapper.get('[data-testid="date-tag-day"]').text()).toBe('12');
  });

  it('應顯示星期', async () => {
    const wrapper = await mountSuspended(DateTag, {
      props: { datetime: '10月12日' },
    });

    // 2024/10/12 為星期六
    expect(wrapper.get('[data-testid="date-tag-dow"]').text()).toBe('星期六');
  });

  it('isToday 為 true 時應顯示 TODAY 徽章', async () => {
    const wrapper = await mountSuspended(DateTag, {
      props: { datetime: '10月12日', isToday: true },
    });

    expect(wrapper.find('[data-testid="date-tag-today"]').exists()).toBe(true);
  });

  it('isToday 為 false 時不應顯示 TODAY 徽章', async () => {
    const wrapper = await mountSuspended(DateTag, {
      props: { datetime: '10月12日' },
    });

    expect(wrapper.find('[data-testid="date-tag-today"]').exists()).toBe(false);
  });

  it('有 description 時應顯示特殊日說明', async () => {
    const wrapper = await mountSuspended(DateTag, {
      props: { datetime: '10月12日', description: '生誕祭' },
    });

    expect(wrapper.get('[data-testid="date-tag-desc"]').text()).toBe('生誕祭');
  });

  it('日期格式無法解析時應顯示原字串', async () => {
    const wrapper = await mountSuspended(DateTag, {
      props: { datetime: '聖誕節' },
    });

    expect(wrapper.find('[data-testid="date-tag-month"]').exists()).toBe(false);
    expect(wrapper.get('[data-testid="date-tag-raw"]').text()).toBe('聖誕節');
  });
});
