import type { H3Event } from 'h3';

/** `defineCdnCachedEventHandler` 的快取設定 */
interface CdnCacheOptions {
  /** nitro cache entry 名稱 */
  name: string;
  /** 快取秒數，同時作為 `s-maxage` 與 `stale-while-revalidate` 的值 */
  maxAge: number;
}

/**
 * 快取繞過判斷。
 *
 * sheet（3h）與 statistics（6h）的長快取在開發時容易讓人誤判修正未生效，
 * 因此 dev 環境一律繞過；正式環境則保留 `?nocache` 查詢參數作為手動繞過手段。
 */
export function shouldBypassCache(event: H3Event): boolean {
  if (import.meta.dev) return true;
  return 'nocache' in getQuery(event);
}

/**
 * 建立 nitro cache 設定。
 *
 * 抽成獨立函式是為了讓 `swr` / `staleMaxAge` 這兩個「少一個 CDN 就整層失效」的欄位
 * 能被測試釘住 —— 它們被拿掉時不會有任何錯誤，只會靜默退回 per-instance 快取。
 */
export function buildCacheOptions({ name, maxAge }: CdnCacheOptions) {
  return {
    name,
    maxAge,
    // 這兩個必須顯式給，理由見 defineCdnCachedEventHandler 的註解
    swr: true,
    staleMaxAge: maxAge,
  } as const;
}

/**
 * 與 `defineCachedEventHandler` 同語意，但額外保證回應會真的進 Vercel edge cache。
 *
 * 背景：原本兩支 API 直接用 `defineCachedEventHandler({ name, maxAge, shouldBypassCache })`，
 * 實測 production 每次請求都是 `x-vercel-cache: MISS`（同一秒連打三次皆然），
 * 回應頭為 `cache-control: max-age=10800`。
 *
 * 根因不只是「Nitro 內建 cache storage 在 serverless 是 per-instance 記憶體」——
 * 那只解釋 function 內部快取為何會被 cold start 清掉，並不解釋 CDN 為何完全沒接手。
 * 真正讓 CDN 沒接手的是那個 `max-age`：
 *
 * - `defineCachedEventHandler(handler, opts = defaultCacheOptions())` 的 `swr: true`
 *   來自「參數預設值」，只有完全不傳 opts 時才生效；一旦傳了物件，nitro 內部
 *   `_opts = { ...opts, ... }` 不會補回預設值（見
 *   `nitropack/dist/runtime/internal/cache.mjs`）。
 * - 於是 `opts.swr` 是 undefined，組 header 時走 `else if (opts.maxAge)` 分支，
 *   吐出瀏覽器專用的 `max-age`，而不是 CDN 看的 `s-maxage`。
 * - Vercel edge 對 function 回應只認 `s-maxage` / `CDN-Cache-Control`，單獨的
 *   `max-age` 不會建立 edge cache。（同一個 deployment 的靜態資產帶
 *   `max-age=31536000, immutable` 第二次請求就 HIT，可見 CDN 本身是正常的。）
 *
 * 所以這裡顯式給 `swr: true` 與 `staleMaxAge`，讓 nitro 產出
 * `s-maxage=<maxAge>, stale-while-revalidate=<maxAge>`。順帶一併修掉
 * 「`swr` 是 undefined 導致 function 內部快取過期時會 blocking 重抓」的問題。
 *
 * 刻意不採用 issue 原本提案的 `routeRules: { swr: N }`：在 nitropack 2.13.3 上
 * `swr: N` 會先被正規化成 `cache: { swr: true, maxAge: N }`，再被 vercel preset 的
 * `deprecateSWR()` 轉成 `isr = cache.swr`（= `true`，秒數被丟掉），最後寫出
 * `expiration: false` 的 prerender-config —— 也就是「永不過期」，並附帶一則
 * deprecation warning。要走 routeRules 得寫 `isr: N` 才正確，但那會把兩支 API
 * 變成 ISR function，`?nocache` 還得另外處理 allowQuery / passQuery，更複雜。
 */
export function defineCdnCachedEventHandler<T>(
  handler: (event: H3Event) => Promise<T>,
  options: CdnCacheOptions,
) {
  const cachedHandler = defineCachedEventHandler(handler, buildCacheOptions(options));

  return defineEventHandler(async (event): Promise<T> => {
    if (shouldBypassCache(event)) {
      // 繞過的目的就是拿新資料，明確標 no-store 避免這次回應被 CDN 或瀏覽器留下。
      // （這條路徑不經 nitro 的 cache handler，所以不會被貼上 s-maxage；
      // 少了這行，`?nocache` 會是「沒有 cache-control」而非「明確不要快取」。）
      setResponseHeader(event, 'cache-control', 'no-store');
      return handler(event);
    }

    return cachedHandler(event) as Promise<T>;
  });
}
