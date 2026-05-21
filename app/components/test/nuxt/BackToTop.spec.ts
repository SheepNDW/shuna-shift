import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import BackToTop from '../../BackToTop.vue';

function setScrollY(value: number): void {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true });
}

function setReducedMotion(matches: boolean): void {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
}

describe('BackToTop', () => {
  beforeEach(() => {
    setScrollY(0);
    window.scrollTo = vi.fn();
    setReducedMotion(false);
  });

  afterEach(() => {
    setScrollY(0);
  });

  it('捲動未超過閾值時不顯示', async () => {
    setScrollY(0);
    const wrapper = await mountSuspended(BackToTop);

    expect(wrapper.find('[data-testid="back-to-top"]').exists()).toBe(false);
  });

  it('掛載時若已捲動超過閾值即顯示', async () => {
    setScrollY(400);
    const wrapper = await mountSuspended(BackToTop);

    expect(wrapper.find('[data-testid="back-to-top"]').exists()).toBe(true);
  });

  it('捲動事件越過閾值後動態顯示', async () => {
    setScrollY(0);
    const wrapper = await mountSuspended(BackToTop);
    expect(wrapper.find('[data-testid="back-to-top"]').exists()).toBe(false);

    setScrollY(400);
    window.dispatchEvent(new Event('scroll'));
    await nextTick();

    expect(wrapper.find('[data-testid="back-to-top"]').exists()).toBe(true);
  });

  it('回到頂部鈕有 aria-label', async () => {
    setScrollY(400);
    const wrapper = await mountSuspended(BackToTop);

    expect(wrapper.get('[data-testid="back-to-top"]').attributes('aria-label')).toBe('回到頂部');
  });

  it('提供訂位連結,並以 responsive class 限定 ≤920px 才顯示', async () => {
    setScrollY(400);
    const wrapper = await mountSuspended(BackToTop);
    const booking = wrapper.get('[data-testid="back-to-top-booking"]');

    expect(booking.attributes('href')).toBeTruthy();
    expect(booking.attributes('target')).toBe('_blank');
    // 桌機隱藏、≤920px 才顯示 —— header「預約」CTA 在 ≤920px 隱藏,此處補足訂位入口
    expect(booking.classes()).toContain('hidden');
    expect(booking.classes()).toContain('max-[920px]:inline-flex');
  });

  it('prefers-reduced-motion:reduce 時以 auto 捲回頂部', async () => {
    setScrollY(400);
    setReducedMotion(true);
    const wrapper = await mountSuspended(BackToTop);

    await wrapper.get('[data-testid="back-to-top"]').trigger('click');

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });

  it('未要求減少動態時以 smooth 捲回頂部', async () => {
    setScrollY(400);
    setReducedMotion(false);
    const wrapper = await mountSuspended(BackToTop);

    await wrapper.get('[data-testid="back-to-top"]').trigger('click');

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
