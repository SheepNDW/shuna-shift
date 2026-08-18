import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import type { NuxtError } from '#app';
import ErrorPage from '~/error.vue';

const { clearErrorMock } = vi.hoisted(() => ({ clearErrorMock: vi.fn() }));
mockNuxtImport('clearError', () => clearErrorMock);

// AppHeader 只是版面的一部分，這支測的是錯誤內容本身；stub 掉可避免
// 連帶把 BrandMark / 導覽列的行為拉進來。
const stubs = {
  AppHeader: defineComponent({ template: '<header />' }),
  NuxtLink: defineComponent({ inheritAttrs: false, template: '<a v-bind="$attrs"><slot /></a>' }),
} as const;

function mountError(error: Partial<NuxtError>) {
  return mountSuspended(ErrorPage, {
    props: { error: error as NuxtError },
    global: { stubs },
  });
}

describe('error.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('404 顯示「迷」與找不到頁面的標題', async () => {
    const wrapper = await mountError({ statusCode: 404 });

    expect(wrapper.get('.empty-kanji').text()).toBe('迷');
    expect(wrapper.get('[data-testid="empty-state-title"]').text()).toBe('找不到這一頁');
  });

  // 呼叫端明確指定的文案（探員頁的 createError）比通用說明精確
  it('採用 createError 帶來的 data.userMessage', async () => {
    const wrapper = await mountError({
      statusCode: 404,
      data: { userMessage: '找不到這位探員，網址中的代號可能打錯了。' },
    });

    expect(wrapper.get('[data-testid="empty-state-subtitle"]').text()).toBe(
      '找不到這位探員，網址中的代號可能打錯了。'
    );
  });

  it('404 沒有 userMessage 時退回預設說明', async () => {
    const wrapper = await mountError({ statusCode: 404 });

    expect(wrapper.get('[data-testid="empty-state-subtitle"]').text()).toContain('網址可能已經失效');
  });

  /**
   * `statusMessage` 混了三種來源，其中兩種不該給使用者看：Nuxt router 的
   * `Page not found: /x`，以及 `/api/sheet` 把上游錯誤原文轉出來的字串。
   * 這兩條測試釘住「一律不讀 statusMessage」。
   */
  it('不呈現 Nuxt router 的 Page not found 原文', async () => {
    const wrapper = await mountError({
      statusCode: 404,
      statusMessage: 'Page not found: /no-such-page',
      data: { path: '/no-such-page' },
    });

    const subtitle = wrapper.get('[data-testid="empty-state-subtitle"]').text();
    expect(subtitle).not.toContain('Page not found');
    expect(subtitle).toContain('網址可能已經失效');
  });

  it('不呈現後端錯誤原文', async () => {
    const wrapper = await mountError({
      statusCode: 500,
      statusMessage: 'getaddrinfo ENOTFOUND sheets.googleapis.com',
    });

    const subtitle = wrapper.get('[data-testid="empty-state-subtitle"]').text();
    expect(subtitle).not.toContain('sheets.googleapis.com');
    expect(subtitle).toContain('班表資料來源');
  });

  it('5xx 顯示「障」與系統錯誤標題', async () => {
    const wrapper = await mountError({ statusCode: 500 });

    expect(wrapper.get('.empty-kanji').text()).toBe('障');
    expect(wrapper.get('[data-testid="empty-state-title"]').text()).toBe('系統暫時無法回應');
  });

  it('圖章標出實際狀態碼', async () => {
    const wrapper = await mountError({ statusCode: 503 });

    expect(wrapper.get('[data-testid="error-stamp"]').text()).toBe('ERROR · 503');
  });

  it('狀態碼缺失時圖章退回 500，而非顯示 undefined', async () => {
    const wrapper = await mountError({});

    expect(wrapper.get('[data-testid="error-stamp"]').text()).toBe('ERROR · 500');
  });

  // 單純換路由不會清掉錯誤狀態，畫面會卡在錯誤頁
  it('回首頁按鈕呼叫 clearError 並指定 redirect', async () => {
    const wrapper = await mountError({ statusCode: 404 });

    await wrapper.get('button').trigger('click');

    expect(clearErrorMock).toHaveBeenCalledWith({ redirect: '/' });
  });
});
