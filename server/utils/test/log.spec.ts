import { describe, expect, it } from 'vitest';
import { formatErrorForLog } from '../log';

/** 仿 ofetch 的 FetchError：message 內含完整請求 URL */
function fetchErrorLike(url: string) {
  return new Error(`[GET] "${url}": 400 Bad Request`);
}

describe('formatErrorForLog', () => {
  const url
    = 'https://sheets.googleapis.com/v4/spreadsheets/abc?ranges=A1%3AC5&key=AIzaSyTOPSECRET123';

  it('遮掉 query string 裡的 API key', () => {
    const output = formatErrorForLog(fetchErrorLike(url));

    expect(output).not.toContain('AIzaSyTOPSECRET123');
    expect(output).toContain('key=[REDACTED]');
  });

  // 遮蔽若把整段訊息吃掉就等於沒有 log，定位問題會更難
  it('保留錯誤本文與其餘 query 參數', () => {
    const output = formatErrorForLog(fetchErrorLike(url));

    expect(output).toContain('400 Bad Request');
    expect(output).toContain('ranges=A1%3AC5');
  });

  it('保留 stack —— 定位問題靠它', () => {
    const error = fetchErrorLike(url);

    expect(formatErrorForLog(error)).toContain('log.spec.ts');
  });

  it('同一段訊息出現多次 key 時全部遮掉', () => {
    const error = new Error(`first ${url} then ${url}`);

    expect(formatErrorForLog(error)).not.toContain('AIzaSyTOPSECRET123');
    expect(formatErrorForLog(error).match(/key=\[REDACTED\]/g)).toHaveLength(2);
  });

  // 這才是「已經沒有 key 可遮」的情況，不該被誤傷
  it('不含 key 的錯誤原樣保留', () => {
    const output = formatErrorForLog(new Error('Sheets 回應結構驗證失敗'));

    expect(output).toContain('Sheets 回應結構驗證失敗');
  });

  it('非 Error 的拋出值也能處理', () => {
    expect(formatErrorForLog('boom')).toBe('boom');
    expect(formatErrorForLog(undefined)).toBe('undefined');
  });

  // `apikey=` / `monkey=` 這種字尾巧合不該被當成 API key
  it('只遮 query 參數本身為 key 的情況', () => {
    const output = formatErrorForLog(new Error('https://example.com/?apikey=NOTTHISONE'));

    expect(output).toContain('apikey=NOTTHISONE');
  });
});
