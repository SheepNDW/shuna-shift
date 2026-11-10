import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { buildCacheOptions } from '../cache';
import { NITROPACK_CHAIN, resolvePackageJsonAlongChain } from './resolve-along-chain';

/**
 * nitropack 升版 canary（issue #44）。
 *
 * `server/utils/cache.ts` 的 `defineCdnCachedEventHandler` 為什麼非顯式給 `swr` 不可，
 * 完整推導寫在那支的註解裡，這裡不複述 —— 有出入時以 `cache.ts` 為準。
 *
 * 需要這支的理由是那條推論**失效時完全無聲**：lint / typecheck / build / 其他測試
 * 全綠、API 照回 200、資料照樣正確，唯一症狀是 `x-vercel-cache` 悄悄退回全 MISS，
 * Sheets API 被打的次數回到 #30 修正前。而既有的 `cache.spec.ts` 只斷言我們**傳出去**
 * 的 options 物件，攔得到「有人刪掉欄位」，攔不到「nitro 的分支條件變了」。
 *
 * ## 做法：抽原始碼原文執行，而不是 import 真的 handler
 *
 * nitro 的 runtime 模組無法在 vitest 直接載入：`#nitro-internal-virtual/*` 是 build
 * 時才產生的 virtual module，且 `config.mjs` 把 `process.env.RUNTIME_CONFIG` 當物件用
 * （同樣是 rollup 替換的佔位符，而 vitest 的 `define` 對 `process.env.*` 不生效）。
 * 要 import 得 stub 掉一整串內部模組，那些空殼本身又會讓行為偏離 production。
 *
 * 抽原始碼跑的仍是 nitro 的程式碼，但不需要它的任何相依。代價是與該段的文字結構
 * 耦合 —— nitro 改寫時抽取會失敗，測試轉紅並吐出指向 #44 的訊息。那正是要的訊號。
 *
 * ## 讀的是 app 實際載入的那份 nitropack
 *
 * nitropack 是 transitive dependency（`nuxt → @nuxt/nitro-server → nitropack`），沒有
 * 列在 `package.json`，也沒有被 hoist 到根 `node_modules`。這裡沿那條依賴鏈逐層解析
 * （`resolvePackageJsonAlongChain`），讀到的就是 app 執行時用的那一份；不依賴任何
 * hoist 設定，也不依賴 pnpm `.bin` shim 設的 `NODE_PATH`。
 */

/** 兩種失敗路徑共用的收尾，抽出來避免各寫一版而漂移 */
const CANARY_TAIL = '請回頭確認 server/utils/cache.ts 的 s-maxage 推論是否還成立（issue #44）。';

/** 檔案讀得到、但抽不出預期的那段 */
const CANARY_BROKEN = `nitropack 的 cache.mjs 與預期不符 —— nitro 很可能改寫了組 cache-control 的那段實作。${CANARY_TAIL}`;

/**
 * 連檔案都拿不到。刻意與 `CANARY_BROKEN` 分開：這條路徑除了「nitro 改了 dist 結構」，
 * 也涵蓋「依賴鏈變了 → 沿鏈解析不到 nitropack」（例如 nuxt 不再經由 `@nuxt/nitro-server`
 * 帶入 nitro），用同一句「nitro 改寫了實作」會把人指往錯的方向。
 */
const CANARY_UNREADABLE = `讀不到 nitropack 的 cache.mjs —— 可能是 nitro 改了 dist 結構，或 nuxt → @nuxt/nitro-server → nitropack 這條依賴鏈變了。${CANARY_TAIL}`;

/**
 * nitro 組 cache-control 的那一段（`nitropack/dist/runtime/internal/cache.mjs`）。
 * 從 `const cacheControl = [];` 一路取到把結果寫回 headers 為止。
 *
 * 帶 `g` 是為了能數匹配數 —— 見 `extractCacheControlBlock` 的唯一性檢查。
 */
const CACHE_CONTROL_BLOCK =
  /const cacheControl = \[\];[\s\S]*?headers\["cache-control"\] = cacheControl\.join\(", "\);\s*\}/g;

/** 讀 nitro 的 cache.mjs 原始碼；讀不到時重拋成指向 #44 的訊息，而不是原生 ENOENT */
function readNitroCacheSource(): string {
  try {
    return readFileSync(
      join(dirname(resolvePackageJsonAlongChain(NITROPACK_CHAIN)), 'dist/runtime/internal/cache.mjs'),
      'utf8',
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`${CANARY_UNREADABLE}（${reason}）`, { cause: error });
  }
}

/**
 * 把那段原始碼原文取出來。
 *
 * 刻意檢查「只匹配到一段」：若 nitro 日後在更前面留下同樣起始字樣的區塊，
 * 取第一個匹配會抽到錯的那段**卻仍然綠燈** —— 那會讓 canary 在最該示警的時候沉默。
 */
function extractCacheControlBlock(): string {
  const matches = readNitroCacheSource().match(CACHE_CONTROL_BLOCK);

  if (matches?.length !== 1) {
    throw new Error(`${CANARY_BROKEN}（預期抽到 1 段，實際 ${matches?.length ?? 0} 段）`);
  }

  return matches[0]!;
}

/**
 * 把 nitro 那段原文餵一份 opts 進去實際跑一次。
 *
 * nitropack 2.13.6 起，那段開頭多了一道 `isCacheableResponse(headers, variableHeaderNames)`
 * 門：回應帶 `set-cookie`、`cache-control` 含 private / no-store / no-cache、或 `vary`
 * 列了非預期的 header 時，整段直接跳過、不下 cache-control。那個 helper 定義在同檔別處，
 * 抽出來的片段裡沒有，所以這裡以 stub 補上；`cacheable` 讓測試能從門的兩側各跑一次。
 * 本專案兩支 API 的回應是純 JSON、不帶上述 header，production 走的是 `true` 那側。
 */
function runNitroCacheControl(
  opts: Record<string, unknown>,
  { cacheable = true }: { cacheable?: boolean } = {},
): string | undefined {
  // 刻意執行 nitro 的原文 —— 跑的是它的程式碼而非我們的複刻，這正是本 canary 的目的
  const build = new Function(
    'opts',
    'cacheable',
    [
      'const headers = {};',
      'const variableHeaderNames = [];',
      'const isCacheableResponse = () => cacheable;',
      extractCacheControlBlock(),
      'return headers["cache-control"];',
    ].join('\n'),
  ) as (opts: Record<string, unknown>, cacheable: boolean) => string | undefined;

  return build(opts, cacheable);
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

    // 先確認真的有值 —— 否則 String(undefined) 不匹配 BARE_MAX_AGE，會空歡喜通過
    expect(cacheControl).toBeDefined();
    expect(String(cacheControl)).not.toMatch(BARE_MAX_AGE);
  });

  /**
   * 反向對照：證明上面三條真的是被 `swr` 決定的，而不是 nitro 無論如何都吐 s-maxage。
   * 這條同時釘住 #30 的根因 —— 少了 `swr`，回應就會退回 CDN 不認的 `max-age`。
   */
  it('沒有 swr 時應該退回 max-age，這正是 #30 當初 CDN 完全沒接手的原因', () => {
    const cacheControl = runNitroCacheControl({ name: 'sheet-get', maxAge });

    expect(cacheControl).toBeDefined();
    expect(String(cacheControl)).toMatch(BARE_MAX_AGE);
    expect(String(cacheControl)).not.toContain('s-maxage');
  });

  /**
   * nitro 2.13.6 新增的那道門：被判定不可快取時整段跳過。釘住它是為了讓「門被拿掉」
   * 有訊號；門的**條件**本身在 helper 裡、不在抽出的片段內，這支看不到，條件變了要靠
   * 升 pin 時回頭對 cache.mjs。
   */
  it('回應被判定不可快取時不應該下任何 cache-control（nitro 2.13.6 新增的門）', () => {
    const cacheControl = runNitroCacheControl(buildCacheOptions({ name: 'sheet-get', maxAge }), {
      cacheable: false,
    });

    expect(cacheControl).toBeUndefined();
  });

  /**
   * 上面幾條驗的是「這樣的 opts 會吐什麼」，補不到「nitro 讀的是哪一份 opts」。
   *
   * 而 #30 的根因正是後者：`defineCachedEventHandler` 的 `swr: true` 來自參數預設值，
   * 傳了 opts 物件就不會補回；組 header 的 closure 讀的又是**未合併**的外層 `opts`
   * （`_opts` 才是合併過的）。哪天它改讀 `_opts`，我們顯式給的 `swr` 就變成多餘 ——
   * 無害，但推論的前提已經不同，值得知道。
   *
   * `\b` 讓 `opts.swr` 不會誤中 `_opts.swr`（`_` 也是 word char，兩者之間沒有邊界）。
   */
  it('組 header 讀的應該仍是未合併的外層 opts，而非合併過的 _opts', () => {
    const block = extractCacheControlBlock();

    expect(block).toMatch(/\bopts\.swr\b/);
    expect(block).not.toContain('_opts');
  });
});
