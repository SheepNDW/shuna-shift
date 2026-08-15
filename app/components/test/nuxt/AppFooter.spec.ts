import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import AppFooter from '../../AppFooter.vue';

/**
 * AppFooter 是 `formatDateTime` 唯一的 render 點，而且在 layout 裡全站渲染。
 *
 * 它不在 `<ClientOnly>` 內：`formatDateTime` 若讀機器本地時間，SSR（Vercel = UTC）
 * 與瀏覽器（UTC+8）會輸出不同字串而 hydration mismatch，因此這裡把「以台北時區
 * 呈現」釘住。
 *
 * 資料來自全站共用的 `useSchedules()`（Nuxt auto-import，必須用 mockNuxtImport 攔）。
 */
const { useSchedulesMock } = vi.hoisted(() => ({ useSchedulesMock: vi.fn() }));
mockNuxtImport('useSchedules', () => useSchedulesMock);

const lastUpdated = ref('');
const hasError = ref(false);

describe('AppFooter', () => {
  beforeEach(() => {
    lastUpdated.value = '';
    hasError.value = false;
    useSchedulesMock.mockResolvedValue({ lastUpdated, hasError });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('未載入時應顯示同步中', async () => {
    const wrapper = await mountSuspended(AppFooter);

    expect(wrapper.text()).toContain('同步中…');
  });

  // 這個 render 之後不會再重試，把硬失敗顯示成「同步中…」等於謊報進行中
  it('載入失敗時應顯示同步失敗，而非同步中', async () => {
    hasError.value = true;

    const wrapper = await mountSuspended(AppFooter);

    expect(wrapper.text()).toContain('同步失敗');
    expect(wrapper.text()).not.toContain('同步中…');
  });

  it('應以台北時區呈現 lastUpdated，與機器時區無關', async () => {
    // UTC 14:30 → 台北 22:30
    lastUpdated.value = '2024-10-28T14:30:00.000Z';

    const wrapper = await mountSuspended(AppFooter);

    expect(wrapper.text()).toContain('2024/10/28 下午10:30');
  });

  it('UTC 仍在前一天時，應顯示台北的日期', async () => {
    // UTC 2024/10/28 17:00 → 台北 2024/10/29 01:00
    lastUpdated.value = '2024-10-28T17:00:00.000Z';

    const wrapper = await mountSuspended(AppFooter);

    expect(wrapper.text()).toContain('2024/10/29 上午01:00');
  });

  it('應以台北時區顯示版權年份', async () => {
    // 台北 2026/01/01 00:00，此刻 UTC 仍是 2025/12/31
    vi.setSystemTime(new Date('2025-12-31T16:00:00Z'));

    const wrapper = await mountSuspended(AppFooter);

    expect(wrapper.text()).toContain('© 2026');
  });
});
