/**
 * e2e 用的假 Google Sheets server，只實作 app 會打的那一支 `spreadsheets.get`。
 *
 * 由 `playwright.config.ts` 的 `webServer` 用 node 直接執行（type stripping），
 * 所以 import 要帶 `.ts` 副檔名，也不能用需要轉譯的 TS 語法（enum 之類）。
 *
 * 資料在每次收到請求的當下，依台北的今天產生（見 `./data.ts`）。
 */
import { createServer } from 'node:http';
import type { ServerResponse } from 'node:http';
import { buildSpreadsheetResponse, taipeiTodayIso } from './data.ts';

const HOST = '127.0.0.1';
const SPREADSHEET_PATH = /^\/v4\/spreadsheets\/[^/]+$/;

const port = Number(process.env.FAKE_SHEETS_PORT);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error('FAKE_SHEETS_PORT 沒設，或不是合法的 port');
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json; charset=UTF-8' });
  response.end(JSON.stringify(body));
}

/** 錯誤回應比照 Google API 的外層形狀 */
function sendError(response: ServerResponse, status: number, message: string): void {
  sendJson(response, status, { error: { code: status, message } });
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${HOST}:${port}`);

  // 給 Playwright 判斷「server 起來了沒」用
  if (url.pathname === '/health') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  if (request.method !== 'GET' || !SPREADSHEET_PATH.test(url.pathname)) {
    sendError(response, 404, `Not found: ${request.method} ${url.pathname}`);
    return;
  }

  // 真的 API 沒帶 key 會拒絕。這裡比照辦理，app 忘了帶 key 時 e2e 才會紅
  if (!url.searchParams.get('key')) {
    sendError(response, 403, 'The request is missing a valid API key.');
    return;
  }

  try {
    sendJson(
      response,
      200,
      buildSpreadsheetResponse(url.searchParams.getAll('ranges'), taipeiTodayIso()),
    );
  } catch (error) {
    sendError(response, 400, error instanceof Error ? error.message : String(error));
  }
});

server.listen(port, HOST);
