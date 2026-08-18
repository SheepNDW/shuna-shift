import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createError,
  createEvent,
  defineEventHandler,
  getQuery,
  setResponseHeader,
} from 'h3';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

/**
 * 兩支 API 在上游失敗時**不可**把 `error.message` 放進 `statusMessage`。
 *
 * ofetch 的 `FetchError` 會把整個請求 URL 塞進 message，其中含
 * `key=<NUXT_GSHEETS_KEY>`；而 nitro 的預設 error handler 會把 `statusMessage`
 * 同時寫進 JSON body 的 `statusMessage` / `message` 兩個欄位、以及 HTTP status line
 * 的 reason phrase。也就是說上游只要正在故障（key 過期 / 配額用盡 / Google 5xx），
 * 任何人打這兩支公開端點都拿得到我們的 API key。
 *
 * 這條路徑比 log 側嚴重得多：log 只有我們看得到。
 */
const API_KEY = 'AIzaSyFAKEKEY_TOPSECRET_123456';

/** 仿 ofetch 失敗時的 message 形狀 */
const LEAKY_MESSAGE
  = `[GET] "https://sheets.googleapis.com/v4/spreadsheets/x?ranges=A1&key=${API_KEY}": 400 Bad Request`;

vi.mock('../../utils/sheets', () => ({
  fetchSheetRanges: vi.fn(async () => {
    throw new Error(LEAKY_MESSAGE);
  }),
  fetchSheetTitles: vi.fn(async () => {
    throw new Error(LEAKY_MESSAGE);
  }),
  resolveSheetTitle: vi.fn(() => '過去班表20260101~'),
  sheetTitleFromRange: vi.fn(() => '每日班表'),
}));

/**
 * handler 模組在 import 當下就會呼叫 `defineCdnCachedEventHandler`，
 * 所以這些 auto-import 必須在 import 之前就位 —— 故用 top-level stub + 動態 import。
 *
 * `createError` 綁 h3 的真實實作：要驗的是我們丟進去的值，不是 h3 怎麼組。
 */
vi.stubGlobal('getQuery', getQuery);
vi.stubGlobal('setResponseHeader', setResponseHeader);
vi.stubGlobal('defineEventHandler', defineEventHandler);
vi.stubGlobal('defineCachedEventHandler', (handler: unknown) => handler);
vi.stubGlobal('createError', createError);

function createTestEvent(url: string) {
  const req = new IncomingMessage(new Socket());
  req.url = url;
  req.method = 'GET';
  return createEvent(req, new ServerResponse(req));
}

/** 跑 handler 並取回它拋出的錯誤 */
async function catchError(path: 'sheet' | 'statistics') {
  const mod = path === 'sheet' ? await import('../sheet.get') : await import('../statistics.get');
  const handler = mod.default as (event: ReturnType<typeof createTestEvent>) => Promise<unknown>;

  return handler(createTestEvent(`/api/${path}`)).then(
    () => {
      throw new Error('預期 handler 拋錯，但它成功回傳了');
    },
    (error: unknown) => error as { statusCode?: number; statusMessage?: string; message?: string },
  );
}

describe.each(['sheet', 'statistics'] as const)('/api/%s 的錯誤回應', (path) => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 反向對照：確認上游丟出來的東西真的含 key，否則下面幾條會空歡喜通過
  it('前提：上游錯誤本身含 API key', () => {
    expect(LEAKY_MESSAGE).toContain(API_KEY);
  });

  it('statusMessage 不含 API key', async () => {
    const error = await catchError(path);

    expect(error.statusMessage).toBeDefined();
    expect(error.statusMessage).not.toContain(API_KEY);
  });

  /**
   * `message` 是 nitro 送進 JSON body 的另一個欄位。h3 的 `createError` 在只給
   * `statusMessage` 時會讓 `message` 跟著它 —— 這條把那個連動釘住，日後若 h3 改成
   * 讓 `message` 另有來源，這裡會先轉紅。
   */
  it('message 不含 API key', async () => {
    const error = await catchError(path);

    expect(error.message).toBeDefined();
    expect(error.message).not.toContain(API_KEY);
  });

  it('仍回 500，不因為換掉訊息而改變狀態碼', async () => {
    const error = await catchError(path);

    expect(error.statusCode).toBe(500);
  });

  /**
   * statusMessage 會被寫進 HTTP status line 的 reason phrase，非 ASCII 會以 latin1
   * 寫出而變成亂碼。診斷資訊本來就該走 log，不該走這裡。
   */
  it('statusMessage 是短的 ASCII 字串', async () => {
    const error = await catchError(path);

    expect(error.statusMessage).toMatch(/^[\x20-\x7E]+$/);
    expect(error.statusMessage!.length).toBeLessThan(60);
  });

  // 診斷資訊沒有消失，只是換到只有我們看得到的地方（且該側已遮蔽 key）
  it('失敗仍會寫進 server log，且 log 內也不含 API key', async () => {
    await catchError(path);

    expect(console.error).toHaveBeenCalledTimes(1);
    const logged = vi.mocked(console.error).mock.calls[0]!.join(' ');
    expect(logged).toContain(`[api/${path}]`);
    expect(logged).not.toContain(API_KEY);
    expect(logged).toContain('key=[REDACTED]');
  });
});
