import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import LoadingState from '../../LoadingState.vue';

describe('LoadingState', () => {
  it('預設顯示「資料載入中…」', async () => {
    const wrapper = await mountSuspended(LoadingState);

    expect(wrapper.text()).toContain('資料載入中…');
  });

  it('渲染自訂訊息', async () => {
    const wrapper = await mountSuspended(LoadingState, {
      props: { message: '載入統計資料中…' },
    });

    expect(wrapper.text()).toContain('載入統計資料中…');
  });

  it('以 role=status 對輔助技術宣告載入狀態', async () => {
    const wrapper = await mountSuspended(LoadingState);
    const status = wrapper.get('[data-testid="loading-state"]');

    // role="status" 已隱含 aria-live="polite",不另外標註
    expect(status.attributes('role')).toBe('status');
  });
});
