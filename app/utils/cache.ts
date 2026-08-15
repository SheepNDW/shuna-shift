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

/** payload 優先、static 次之。兩支策略共用的查表。 */
function readCached<T>(key: string, source: PayloadSource): T | undefined {
  return (source.payload.data[key] ?? source.static.data[key]) as T | undefined;
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
 * **沒有時效判斷，而且這代表「一個分頁只抓一次」。** Nuxt 的 purgeCachedData
 * 只在「沒有自訂 getCachedData」時，才會於最後一個消費端卸載時清掉 payload
 * —— `asyncData.js` 的 `if (purgeCachedData && !hasCustomGetCachedData)`。
 * 傳了這支就等於永遠不清，資料在整個 SPA session 內不會重抓，要更新得整頁 reload。
 *
 * 這是刻意接受的：與改用 composable 之前的 Pinia store 行為一致（store 以
 * `status !== 'idle'` 擋住重抓），而班表一天也更新不了幾次。若日後要讓長時間
 * 開著的分頁自己更新，改用 `makeTtlCache` 並挑一個合適的 TTL。
 */
export function reusePayloadData<T>(key: string, source: PayloadSource): T | undefined {
  return readCached<T>(key, source);
}

/**
 * 產生一個帶新鮮度上限的 `getCachedData`。
 *
 * Nuxt 預設的 getCachedData 只要 payload / static 命中就永遠回傳快取，同一個分頁
 * 從頭到尾不會再打 API。對長時間開著不關的分頁太久，故改以回應自帶的
 * `metadata.lastUpdated` 判斷資料本身有多舊 —— 而不是快取寫入的時間點，
 * 後者只代表「我什麼時候拿到」，拿到的可能本來就是 CDN 上放了很久的東西。
 *
 * `lastUpdated` 缺漏、解析不出時間、或落在未來一律視為過期：寧可多打一次 API，
 * 也不要把一份不知道多舊的資料當成新的。未來時間戳（伺服器時鐘偏移或值寫壞）
 * 要特別擋，否則 `now - fetchedAt` 為負，永遠不會超過 ttl，那份資料會被當成
 * 永遠新鮮而一直用下去。
 */
export function makeTtlCache<T extends DatedResponse>(ttlMs: number) {
  return (key: string, source: PayloadSource): T | undefined => {
    const cached = readCached<T>(key, source);
    if (!cached) return undefined;

    const fetchedAt = new Date(cached.metadata?.lastUpdated ?? '').getTime();
    const age = Date.now() - fetchedAt;
    if (Number.isNaN(fetchedAt) || age < 0 || age > ttlMs) {
      return undefined;
    }

    return cached;
  };
}
