import type { H3Event } from 'h3';

/**
 * `stale-while-revalidate` 的窗口秒數。
 *
 * 這個指示詞只需要覆蓋「背景 revalidate 實際花的時間」——
 * 對兩支 API 來說就是一次 Google Sheets 往返（本機實測 sub-second）。
 * 60 秒已有兩個數量級的餘裕。
 *
 * 但要理解它實際多常生效：窗口是從 `s-maxage` 到期那一刻起算的 60 秒，
 * 必須有請求落在這 60 秒內，edge 才會送 stale 並在背景 revalidate；
 * 沒有的話下一個請求就是 blocking MISS。以本站的流量，多數過期大概仍會
 * 撞到一次 blocking 重抓 —— 那是選「新鮮度優先」本來就接受的代價。
 * 這個常數的作用是在邊界真的有併發時，不要讓它們全部穿透到 origin。
 *
 * 刻意不沿用 `maxAge`：`s-maxage=N` + `stale-while-revalidate=N` 的合併窗口是 2N，
 * 會把最壞情況的陳舊上限推到 sheet 6h / statistics 12h。對一個「現在誰值班」的
 * 工具來說太久，用固定 60 秒把上限壓回 maxAge + 60s。
 */
const STALE_WHILE_REVALIDATE_SECONDS = 60;

/** `defineCdnCachedEventHandler` 的快取設定 */
interface CdnCacheOptions {
  /** nitro cache entry 名稱 */
  name: string;
  /** 快取秒數，作為 `s-maxage` 的值 */
  maxAge: number;
}

/**
 * 快取繞過判斷。
 *
 * sheet（3h）與 statistics（6h）的長快取在開發時容易讓人誤判修正未生效，
 * 因此 dev 環境一律繞過；正式環境則保留 `?nocache` 查詢參數作為手動繞過手段。
 */
function shouldBypassCache(event: H3Event): boolean {
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
    staleMaxAge: STALE_WHILE_REVALIDATE_SECONDS,
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
 * `s-maxage=<maxAge>, stale-while-revalidate=<STALE_WHILE_REVALIDATE_SECONDS>`。
 *
 * 注意「`swr` 是 undefined」只影響 header，不影響 function 內部快取的 blocking 行為：
 * `_opts` 只 spread 呼叫端的 opts，之後 `defineCachedFunction` 會做
 * `{ ...defaultCacheOptions(), ...opts }` 把 `swr: true` 補回來，而真正決定
 * 「回傳 stale entry 並背景 revalidate」的分支讀的是那份已合併的 opts。
 * 也就是內部快取本來就是 non-blocking SWR，這裡沒有改到它。
 *
 * 權衡：nitro 的 header 分支是互斥的（`if (opts.swr) ... else if (opts.maxAge) ...`），
 * 開了 `swr` 就必然拿不到 `max-age`，也就是**刻意**放棄瀏覽器端快取換取 CDN HIT。
 * 瀏覽器不認 `s-maxage`，而 `last-modified` 是產生當下的時間、heuristic freshness ≈ 0，
 * 因此 client-side 換頁時會真的發出請求 —— 但那些請求會終止在 edge 而非 origin，
 * function invocation 仍然是降的。用 nitro 的 opts API 無法同時產出兩者；
 * 真要保留瀏覽器快取得改成自己寫 header，不值得為此繞過框架。
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

    return cachedHandler(event);
  });
}
