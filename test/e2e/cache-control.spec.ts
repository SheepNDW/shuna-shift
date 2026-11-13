import { expect, test } from '@nuxt/test-utils/playwright';

/**
 * cache-control 的 canary：看 build 出來的 server 實際送出的 header。
 *
 * unit 那一側（`server/utils/test/cache-header.spec.ts`）驗的是 nitro 組 header 的那段
 * 邏輯；這裡補的是它看不到的部分 —— 邏輯沒變，但 header 寫入的時機變了、或之後被
 * 別處蓋掉。那種情況只有看真正的回應才抓得到。
 *
 * 驗的是 nitro 交出來的 header。部署到 Vercel 之後 `s-maxage` 會被 proxy 消化掉，
 * 那一段不在這支測試的範圍內。
 */

/**
 * 把 cache-control 拆成一條條指令再比。不能直接對整個字串用 `includes('max-age')`：
 * `s-maxage=…` 這個字串本身就含有 `max-age`，會永遠命中。
 */
function parseDirectives(cacheControl: string | undefined): string[] {
  return (cacheControl ?? '').split(',').map((directive) => directive.trim());
}

/** 各端點在 CDN 上該快取多久（秒），對應各自 handler 的 `maxAge` */
const ENDPOINTS = [
  { path: '/api/sheet', sMaxAge: 60 * 60 * 3 },
  { path: '/api/statistics', sMaxAge: 60 * 60 * 6 },
];

for (const { path, sMaxAge } of ENDPOINTS) {
  test.describe(`${path} 的 cache-control`, () => {
    test(`一般請求帶 s-maxage=${sMaxAge}，而且沒有單獨的 max-age`, async ({ request }) => {
      const response = await request.get(path);

      // 上游失敗的回應不帶快取 header；先確認成功，失敗時才看得出是哪一邊的問題
      expect(response.status()).toBe(200);
      const directives = parseDirectives(response.headers()['cache-control']);
      // 釘住數值而不只是「有 s-maxage」：`s-maxage=0` 也算有，但等於沒快取
      expect(directives).toContain(`s-maxage=${sMaxAge}`);
      expect(directives.filter((directive) => directive.startsWith('max-age='))).toEqual([]);
    });

    test('帶 ?nocache 時是 no-store', async ({ request }) => {
      const response = await request.get(`${path}?nocache`);

      expect(response.status()).toBe(200);
      expect(response.headers()['cache-control']).toBe('no-store');
    });
  });
}
