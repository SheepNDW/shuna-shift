import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createEvent,
  defineEventHandler,
  getQuery,
  getResponseHeader,
  setResponseHeader,
} from 'h3';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { buildCacheOptions, defineCdnCachedEventHandler } from '../cache';

/** 造一個能餵給 h3 utils 的真實 H3Event（`getQuery` 只需要 req.url） */
function createTestEvent(url: string) {
  const req = new IncomingMessage(new Socket());
  req.url = url;
  req.method = 'GET';
  return createEvent(req, new ServerResponse(req));
}

/**
 * `cache.ts` 用的 `getQuery` / `setResponseHeader` / `defineEventHandler` /
 * `defineCachedEventHandler` 都是 Nuxt auto-import，在 unit 的 node 環境下不存在。
 *
 * 前三個直接綁 h3 的真實 export（要測的是我們的分支，不是 h3）；
 * `defineCachedEventHandler` 只能用 spy 代替 —— nitro 的 runtime cache 模組無法在
 * vitest 單獨 import（會炸 `Package import specifier
 * "#nitro-internal-virtual/app-config" is not defined`），真正的 header 端到端
 * 只能靠 production build 實測。
 */
const cachedHandlerSpy = vi.fn(async () => 'from-cache');
const defineCachedEventHandlerSpy = vi.fn(() => cachedHandlerSpy);

beforeEach(() => {
  vi.stubGlobal('getQuery', getQuery);
  vi.stubGlobal('setResponseHeader', setResponseHeader);
  vi.stubGlobal('defineEventHandler', defineEventHandler);
  vi.stubGlobal('defineCachedEventHandler', defineCachedEventHandlerSpy);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

/**
 * 釘住兩個「拿掉也不會報錯，只會靜默失效」的欄位。
 * 為何非給不可，見 `cache.ts` 的 `defineCdnCachedEventHandler` 註解。
 */
describe('buildCacheOptions', () => {
  it('應該顯式帶上 swr，讓 nitro 產出 CDN 看得懂的 s-maxage 而非 max-age', () => {
    const options = buildCacheOptions({ name: 'sheet-get', maxAge: 60 * 60 * 3 });

    expect(options.swr).toBe(true);
  });

  it('應該帶上有秒數的 staleMaxAge，且不沿用 maxAge（避免合併窗口變成 2N）', () => {
    const maxAge = 60 * 60 * 3;
    const options = buildCacheOptions({ name: 'sheet-get', maxAge });

    // 裸的 `stale-while-revalidate` 不符 RFC 5861（必須帶 delta-seconds）
    expect(options.staleMaxAge).toBeGreaterThan(0);
    expect(options.staleMaxAge).toBeLessThan(maxAge);
  });

  it('應該原樣帶入 name 與 maxAge', () => {
    const options = buildCacheOptions({ name: 'statistics-get', maxAge: 6 * 60 * 60 });

    expect(options.name).toBe('statistics-get');
    expect(options.maxAge).toBe(21600);
  });
});

describe('defineCdnCachedEventHandler', () => {
  const options = { name: 'sheet-get', maxAge: 60 * 60 * 3 };

  it('應該用 buildCacheOptions 的結果建立 nitro cached handler', () => {
    const handler = vi.fn(async () => 'fresh');
    defineCdnCachedEventHandler(handler, options);

    expect(defineCachedEventHandlerSpy).toHaveBeenCalledTimes(1);
    expect(defineCachedEventHandlerSpy).toHaveBeenCalledWith(handler, buildCacheOptions(options));
  });

  it('未帶 ?nocache 時應該委派給 cached handler，不直接呼叫原 handler', async () => {
    const handler = vi.fn(async () => 'fresh');
    const wrapped = defineCdnCachedEventHandler(handler, options);

    const result = await wrapped(createTestEvent('/api/sheet'));

    expect(result).toBe('from-cache');
    expect(cachedHandlerSpy).toHaveBeenCalledTimes(1);
    expect(handler).not.toHaveBeenCalled();
  });

  it('帶 ?nocache 時應該繞過快取、直接呼叫原 handler', async () => {
    const handler = vi.fn(async () => 'fresh');
    const wrapped = defineCdnCachedEventHandler(handler, options);

    const result = await wrapped(createTestEvent('/api/sheet?nocache'));

    expect(result).toBe('fresh');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(cachedHandlerSpy).not.toHaveBeenCalled();
  });

  it('帶 ?nocache 時應該標 no-store，避免繞過的回應被 CDN 用自己的 cache key 存起來', async () => {
    const wrapped = defineCdnCachedEventHandler(async () => 'fresh', options);
    const event = createTestEvent('/api/sheet?nocache');

    await wrapped(event);

    expect(getResponseHeader(event, 'cache-control')).toBe('no-store');
  });

  it('?nocache 帶值時也應該生效（方便手動用 ?nocache=1 繞過）', async () => {
    const handler = vi.fn(async () => 'fresh');
    const wrapped = defineCdnCachedEventHandler(handler, options);

    await wrapped(createTestEvent('/api/sheet?nocache=1'));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handler 拋錯時 no-store 仍應該留在回應上（header 先於 handler 設定）', async () => {
    const wrapped = defineCdnCachedEventHandler(async () => {
      throw new Error('sheets down');
    }, options);
    const event = createTestEvent('/api/sheet?nocache');

    await expect(wrapped(event)).rejects.toThrow('sheets down');
    expect(getResponseHeader(event, 'cache-control')).toBe('no-store');
  });
});
