import { describe, expect, it } from 'vitest';
import { buildCacheOptions } from '../cache';

/**
 * 這組測試釘的是「拿掉也不會報錯，只會靜默失效」的兩個欄位。
 *
 * nitro 組 `cache-control` 時走 `if (opts.swr) ... else if (opts.maxAge)`：
 * `swr` 一旦是 undefined 就會吐出瀏覽器專用的 `max-age`，而 Vercel edge 對 function
 * 回應只認 `s-maxage`，於是 CDN 完全不會建立快取 —— 這正是 issue #30 的成因，
 * 且沒有任何錯誤訊息。
 */
describe('buildCacheOptions', () => {
  it('應該顯式帶上 swr，讓 nitro 產出 CDN 看得懂的 s-maxage 而非 max-age', () => {
    const options = buildCacheOptions({ name: 'sheet-get', maxAge: 60 * 60 * 3 });

    expect(options.swr).toBe(true);
  });

  it('應該顯式帶上 staleMaxAge，避免產出沒有秒數的 stale-while-revalidate', () => {
    const maxAge = 60 * 60 * 3;
    const options = buildCacheOptions({ name: 'sheet-get', maxAge });

    // 不給 staleMaxAge 時 nitro 會吐出裸的 `stale-while-revalidate`，
    // 不符 RFC 5861（該指示詞必須帶 delta-seconds）
    expect(options.staleMaxAge).toBe(maxAge);
  });

  it('應該原樣帶入 name 與 maxAge', () => {
    const options = buildCacheOptions({ name: 'statistics-get', maxAge: 6 * 60 * 60 });

    expect(options.name).toBe('statistics-get');
    expect(options.maxAge).toBe(21600);
  });
});
