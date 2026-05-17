import type { H3Event } from 'h3';

/**
 * 快取繞過判斷，供 `defineCachedEventHandler` 的 `shouldBypassCache` 使用。
 *
 * sheet（3h）與 statistics（6h）的長快取在開發時容易讓人誤判修正未生效，
 * 因此 dev 環境一律繞過；正式環境則保留 `?nocache` 查詢參數作為手動繞過手段。
 */
export function shouldBypassCache(event: H3Event): boolean {
  if (import.meta.dev) return true;
  return 'nocache' in getQuery(event);
}
