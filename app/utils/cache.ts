/**
 * 只取 `getCachedData` 真正會碰到的兩個資料袋。
 *
 * 縮到最小是為了讓這支能在 node 環境單獨測試（不必造一整個 NuxtApp）；
 * `NuxtApp` 的欄位是這個型別的超集合，仍可直接傳進來。
 */
interface PayloadSource {
  payload: { data: Record<string, unknown> };
  static: { data: Record<string, unknown> };
}

/** 回應必須自帶「這份資料何時產生」，TTL 才有東西可比。 */
interface DatedResponse {
  metadata?: { lastUpdated?: string };
}

/**
 * 「同一份資料只抓一次」的 `getCachedData`。
 *
 * 非得自己寫不可，是因為 Nuxt 預設的 getCachedData 在 server 端只讀
 * `nuxtApp.static.data`，而那份在 SSR 當下是空的 —— 抓回來的結果寫在
 * `payload.data`。結果同一次 SSR 裡第二個共用 key 的呼叫端（layout 的 footer
 * 與頁面各算一個）會各自再打一次 API，光靠共用 key 擋不住。改讀 `payload.data`
 * 就是「這次 render 已經拿過就直接用」。
 *
 * 沒有時效判斷：呼叫端全部卸載後 Nuxt 會自行清掉 `payload.data[key]`
 * （`purgeCachedData` 預設開啟），下次進來自然重抓。
 */
export function reusePayloadData<T>(key: string, source: PayloadSource): T | undefined {
  return (source.payload.data[key] ?? source.static.data[key]) as T | undefined;
}

/**
 * 產生一個帶新鮮度上限的 `getCachedData`。
 *
 * Nuxt 預設的 getCachedData 只要 payload / static 命中就永遠回傳快取，同一個分頁
 * 從頭到尾不會再打 API。對長時間開著不關的分頁太久，故改以回應自帶的
 * `metadata.lastUpdated` 判斷資料本身有多舊 —— 而不是快取寫入的時間點，
 * 後者只代表「我什麼時候拿到」，拿到的可能本來就是 CDN 上放了很久的東西。
 *
 * `lastUpdated` 缺漏或解析不出時間一律視為過期：寧可多打一次 API，
 * 也不要把一份不知道多舊的資料當成新的。
 */
export function makeTtlCache<T extends DatedResponse>(ttlMs: number) {
  return (key: string, source: PayloadSource): T | undefined => {
    const cached = (source.payload.data[key] ?? source.static.data[key]) as T | undefined;
    if (!cached) return undefined;

    const fetchedAt = new Date(cached.metadata?.lastUpdated ?? '').getTime();
    if (Number.isNaN(fetchedAt) || Date.now() - fetchedAt > ttlMs) {
      return undefined;
    }

    return cached;
  };
}
