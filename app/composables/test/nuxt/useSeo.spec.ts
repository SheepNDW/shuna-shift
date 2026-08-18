import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useSeo } from '~/composables/useSeo';

/**
 * 直接斷言傳給 `useSeoMeta` / `useHead` 的內容，而不是去 DOM 撈 `<meta>`。
 *
 * 這支要擋的失效方式全都發生在「值組錯」這一層：og:title 與 <title> 不同步、
 * canonical 帶到相對路徑、query 混進 canonical。這些在瀏覽器裡一律看不出來，
 * 只有分享出去才會發現。攔在參數這一層最直接，也不必和 unhead 的渲染時機纏鬥。
 */
const { useSeoMetaMock, useHeadMock, useRouteMock } = vi.hoisted(() => ({
  useSeoMetaMock: vi.fn(),
  useHeadMock: vi.fn(),
  useRouteMock: vi.fn(),
}));

mockNuxtImport('useSeoMeta', () => useSeoMetaMock);
mockNuxtImport('useHead', () => useHeadMock);
mockNuxtImport('useRoute', () => useRouteMock);

/** `useSeoMeta` 收到的那個物件 */
function seoMeta() {
  return useSeoMetaMock.mock.calls[0]?.[0] as Record<string, unknown>;
}

/** `useHead` 收到的 canonical href */
function canonicalHref() {
  const head = useHeadMock.mock.calls[0]?.[0] as { link?: { rel: string; href: string }[] };
  return head.link?.find((link) => link.rel === 'canonical')?.href;
}

describe('useSeo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRouteMock.mockReturnValue({ path: '/agents' });
  });

  it('標題統一補上站名，各頁不必自己組', () => {
    useSeo({ title: '探員圖鑑', description: '探員清單' });

    expect(seoMeta().title).toBe('朱雫查班工具 - 探員圖鑑');
  });

  // og:title / twitter:title 與 <title> 各寫一份時很容易漂移，
  // 而漂移的症狀只有「分享卡片標題和頁面不一樣」，平常完全看不到。
  it('og:title 與 twitter:title 與 <title> 完全一致', () => {
    useSeo({ title: '值班統計', description: '統計資料' });

    const meta = seoMeta();
    expect(meta.ogTitle).toBe(meta.title);
    expect(meta.twitterTitle).toBe(meta.title);
  });

  it('description 一路帶到 og 與 twitter', () => {
    useSeo({ title: '完整班表', description: '完整排班表' });

    const meta = seoMeta();
    expect(meta.description).toBe('完整排班表');
    expect(meta.ogDescription).toBe('完整排班表');
    expect(meta.twitterDescription).toBe('完整排班表');
  });

  // 相對路徑的 og:url / og:image 會被 LINE 與 Facebook 直接忽略 —— 卡片就是不出現，
  // 沒有任何錯誤訊息。
  it('og:url 與 og:image 都是絕對網址', () => {
    useSeo({ title: '探員圖鑑', description: '探員清單' });

    const meta = seoMeta();
    expect(meta.ogUrl).toBe('https://shuna-shift.vercel.app/agents');
    expect(String(meta.ogImage)).toMatch(/^https:\/\/shuna-shift\.vercel\.app\//);
    expect(meta.twitterImage).toBe(meta.ogImage);
  });

  it('og:image 帶顯式寬高，抓不到尺寸的平台才不會退成小圖', () => {
    useSeo({ title: '探員圖鑑', description: '探員清單' });

    const meta = seoMeta();
    expect(meta.ogImageWidth).toBe(1200);
    expect(meta.ogImageHeight).toBe(630);
  });

  it('canonical 與 og:url 指向同一個網址', () => {
    useSeo({ title: '探員圖鑑', description: '探員清單' });

    expect(canonicalHref()).toBe(seoMeta().ogUrl);
  });

  /**
   * `/shifts?date=` 與 `/agents?filter=` 的 query 只影響捲動位置與前端篩選，
   * 內容是同一份。帶進 canonical 會讓同一頁被拆成好幾個 URL。
   */
  it('canonical 只取 path，不帶 query', () => {
    useRouteMock.mockReturnValue({ path: '/shifts', query: { date: '2026-08-18' } });

    useSeo({ title: '完整班表', description: '完整排班表' });

    expect(canonicalHref()).toBe('https://shuna-shift.vercel.app/shifts');
  });
});
