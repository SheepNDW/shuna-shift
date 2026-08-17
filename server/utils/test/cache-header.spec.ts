import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { buildCacheOptions } from '../cache';

/**
 * nitropack 升版 canary（issue #44）。
 *
 * `defineCdnCachedEventHandler` 建立在一條 nitropack **內部實作**的推論上：
 * 組 header 的分支是互斥的（`if (opts.swr) { s-maxage } else if (opts.maxAge) { max-age }`），
 * 所以必須顯式給 `swr: true`，回應才會帶 Vercel edge 認得的 `s-maxage`。
 *
 * 這條推論一旦被 nitro 改掉，失效是**完全無聲**的：lint / typecheck / build /
 * 其他測試全綠、API 照回 200、資料照樣正確，唯一症狀是 `x-vercel-cache` 悄悄退回
 * 全 MISS，Sheets API 被打的次數回到 #30 修正前。
 *
 * `cache.spec.ts` 那層只斷言我們**傳出去**的 options 物件，攔得到「有人刪掉欄位」，
 * 攔不到「nitro 的分支條件變了」。這支補的就是後者。
 *
 * ## 為什麼是抽原始碼跑，而不是 import 真的 handler
 *
 * nitro 的 runtime 模組無法在 vitest 直接載入：`#nitro-internal-virtual/*` 是 build
 * 時才產生的 virtual module，且 `config.mjs` 把 `process.env.RUNTIME_CONFIG` 當物件用
 * （同樣是 build 時被 rollup 替換的佔位符）。要 import 得 stub 掉一整串內部模組，
 * 那些空殼本身又會讓行為偏離 production。
 *
 * 所以改成把那段 header 組裝的**原始碼原文**抽出來執行 —— 跑的仍是 nitro 的程式碼，
 * 但不需要它的任何相依。代價是與該段的文字結構耦合：nitro 改寫那段時抽取會失敗，
 * 測試轉紅。那正是要的訊號，失敗訊息會直接指向該回頭確認什麼。
 *
 * ## 這支測不到的部分
 *
 * 它驗「給定這樣的 opts，nitro 吐什麼 header」，不驗「nitro 讀的是未合併的外層 opts
 * 還是合併過的 _opts」。後者由下面 `讀的應該是未合併的外層 opts` 那條用原始碼斷言補上。
 */

const require = createRequire(import.meta.url);
const NITRO_CACHE_SOURCE = readFileSync(
  join(dirname(require.resolve('nitropack/package.json')), 'dist/runtime/internal/cache.mjs'),
  'utf8',
);

/**
 * nitro 組 cache-control 的那一段（`nitropack/dist/runtime/internal/cache.mjs`）。
 * 從 `const cacheControl = [];` 一路取到把結果寫回 headers 為止。
 */
const CACHE_CONTROL_BLOCK =
  /const cacheControl = \[\];[\s\S]*?headers\["cache-control"\] = cacheControl\.join\(", "\);\s*\}/;

/** 把 nitro 那段原始碼原文拿出來，餵一份 opts 進去實際跑一次 */
function runNitroCacheControl(opts: Record<string, unknown>): string | undefined {
  const block = NITRO_CACHE_SOURCE.match(CACHE_CONTROL_BLOCK)?.[0];

  if (!block) {
    throw new Error(
      '在 nitropack 的 cache.mjs 找不到 cache-control 組裝段。' +
        'nitro 很可能改寫了那段實作 —— 請回頭確認 server/utils/cache.ts 的 s-maxage 推論是否還成立（issue #44）。',
    );
  }

  // 刻意執行 nitro 的原文 —— 跑的是它的程式碼而非我們的複刻，這正是本 canary 的目的
  const build = new Function(
    'opts',
    `const headers = {};\n${block}\nreturn headers["cache-control"];`,
  ) as (opts: Record<string, unknown>) => string | undefined;

  return build(opts);
}

/** `max-age=` 但前面不接 `s-`（`s-maxage` 沒有連字號，不會誤中） */
const BARE_MAX_AGE = /(^|[\s,])max-age=/;

describe('nitro cache-control canary', () => {
  const maxAge = 60 * 60 * 3;

  it('buildCacheOptions 的結果應該讓 nitro 吐出 CDN 認得的 s-maxage', () => {
    const cacheControl = runNitroCacheControl(buildCacheOptions({ name: 'sheet-get', maxAge }));

    expect(cacheControl).toContain(`s-maxage=${maxAge}`);
  });

  it('應該帶上有秒數的 stale-while-revalidate，而非 RFC 5861 不允許的裸指示詞', () => {
    const cacheControl = runNitroCacheControl(buildCacheOptions({ name: 'sheet-get', maxAge }));

    expect(cacheControl).toMatch(/stale-while-revalidate=\d+/);
  });

  it('不應該同時吐出瀏覽器專用的 max-age（分支互斥，出現代表 nitro 行為變了）', () => {
    const cacheControl = runNitroCacheControl(buildCacheOptions({ name: 'sheet-get', maxAge }));

    expect(String(cacheControl)).not.toMatch(BARE_MAX_AGE);
  });

  /**
   * 反向對照：證明上面三條真的是被 `swr` 決定的，而不是 nitro 無論如何都吐 s-maxage。
   * 這條同時釘住 #30 的根因 —— 少了 `swr`，回應就會退回 CDN 不認的 `max-age`。
   */
  it('沒有 swr 時應該退回 max-age，這正是 #30 當初 CDN 完全沒接手的原因', () => {
    const cacheControl = String(runNitroCacheControl({ name: 'sheet-get', maxAge }));

    expect(cacheControl).toMatch(BARE_MAX_AGE);
    expect(cacheControl).not.toContain('s-maxage');
  });

  /**
   * 上面幾條驗的是「這樣的 opts 會吐什麼」，補不到「nitro 讀的是哪一份 opts」。
   *
   * 而 #30 的根因正是後者：`defineCachedEventHandler` 的 `swr: true` 來自參數預設值，
   * 傳了 opts 物件就不會補回；組 header 的 closure 讀的又是**未合併**的外層 `opts`
   * （`_opts` 才是合併過的）。哪天它改讀 `_opts`，我們顯式給的 `swr` 就變成多餘 ——
   * 無害，但推論的前提已經不同，值得知道。
   */
  it('組 header 讀的應該仍是未合併的外層 opts，而非合併過的 _opts', () => {
    const block = NITRO_CACHE_SOURCE.match(CACHE_CONTROL_BLOCK)?.[0] ?? '';

    expect(block).toContain('opts.swr');
    expect(block).not.toContain('_opts');
  });
});
