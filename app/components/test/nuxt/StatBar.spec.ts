import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import StatBar from '../../StatBar.vue';

describe('StatBar', () => {
  it('應渲染早班與晚班兩段', async () => {
    const wrapper = await mountSuspended(StatBar, {
      props: { dayCount: 6, nightCount: 4, maxTotal: 10 },
    });

    expect(wrapper.find('[data-testid="stat-bar-day"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="stat-bar-night"]').exists()).toBe(true);
  });

  it('應依 maxTotal 等比換算各段寬度', async () => {
    const wrapper = await mountSuspended(StatBar, {
      props: { dayCount: 6, nightCount: 3, maxTotal: 12 },
    });

    // 6 / 12 = 50%、3 / 12 = 25%
    expect(wrapper.get('[data-testid="stat-bar-day"]').attributes('style')).toContain(
      'width: 50%',
    );
    expect(wrapper.get('[data-testid="stat-bar-night"]').attributes('style')).toContain(
      'width: 25%',
    );
  });

  it('aria-label 應描述早 / 晚班次數', async () => {
    const wrapper = await mountSuspended(StatBar, {
      props: { dayCount: 8, nightCount: 5, maxTotal: 13 },
    });

    expect(wrapper.get('[data-testid="stat-bar"]').attributes('aria-label')).toBe(
      '早班 8 班、晚班 5 班',
    );
  });

  it('maxTotal 為 0 時寬度不應為 NaN', async () => {
    const wrapper = await mountSuspended(StatBar, {
      props: { dayCount: 0, nightCount: 0, maxTotal: 0 },
    });

    const dayStyle = wrapper.get('[data-testid="stat-bar-day"]').attributes('style') ?? '';
    expect(dayStyle).not.toContain('NaN');
    expect(dayStyle).toContain('width: 0%');
  });
});
