import { describe, expect, it, vi } from 'vitest';
import {
  buildSheetsUrl,
  parseSheetTitles,
  parseSheetsResponse,
  resolveSheetTitle,
  sheetTitleFromRange,
} from '../sheets';

describe('sheetTitleFromRange', () => {
  it('應該取出 `!` 之前的 sheet 標題', () => {
    expect(sheetTitleFromRange('每日班表!A5:C')).toBe('每日班表');
    expect(sheetTitleFromRange('過去班表20260101~!A5:C743')).toBe('過去班表20260101~');
  });

  it('當沒有 `!` 時，應該回傳整個字串', () => {
    expect(sheetTitleFromRange('每日班表')).toBe('每日班表');
  });
});

describe('buildSheetsUrl', () => {
  it('應該帶入 spreadsheetId、所有 ranges、fields 與 key', () => {
    const url = buildSheetsUrl('sheet-id', ['每日班表!A5:C', '過去班表!A5:C'], 'my-key');
    const parsed = new URL(url);

    expect(parsed.origin + parsed.pathname).toBe(
      'https://sheets.googleapis.com/v4/spreadsheets/sheet-id',
    );
    expect(parsed.searchParams.getAll('ranges')).toEqual(['每日班表!A5:C', '過去班表!A5:C']);
    expect(parsed.searchParams.get('key')).toBe('my-key');
    expect(parsed.searchParams.get('fields')).toContain('sheets.properties.title');
  });

  it('傳入自訂 fields 與空 ranges 時（metadata request），應該據此組裝', () => {
    const url = buildSheetsUrl('sheet-id', [], 'my-key', 'sheets.properties.title');
    const parsed = new URL(url);

    expect(parsed.searchParams.getAll('ranges')).toEqual([]);
    expect(parsed.searchParams.get('fields')).toBe('sheets.properties.title');
  });
});

describe('parseSheetTitles', () => {
  it('應該取出所有 sheet 的標題', () => {
    const raw = {
      sheets: [
        { properties: { title: '每日班表' } },
        { properties: { title: '過去班表20260101~' } },
      ],
    };

    expect(parseSheetTitles(raw)).toEqual(['每日班表', '過去班表20260101~']);
  });

  it('應該略過並警告缺少 properties.title 的 sheet', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const raw = { sheets: [{ properties: { title: '每日班表' } }, { data: [] }] };

    expect(parseSheetTitles(raw)).toEqual(['每日班表']);
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it('當回應結構異常時，應該拋錯', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => parseSheetTitles({})).toThrow(/Google Sheets 回應結構異常/);
    errorSpy.mockRestore();
  });
});

describe('resolveSheetTitle', () => {
  it('恰好一個使用中 sheet 時，應該回傳它', () => {
    const titles = ['每日班表', '過去班表20260101~'];

    expect(resolveSheetTitle(titles, '過去班表')).toBe('過去班表20260101~');
  });

  it('混有已封存 sheet 時，應該只鎖定使用中（`~` 結尾、無結束日）者', () => {
    // 比照實際試算表：使用中 + 兩個已封存的歷史 sheet
    const titles = [
      '每日班表',
      '過去班表20260101~',
      '過去班表20250101~20251231',
      '過去班表20240501~20241231',
    ];

    expect(resolveSheetTitle(titles, '過去班表')).toBe('過去班表20260101~');
  });

  it('應該排除前綴相符但非嚴格格式的備份／暫存頁籤', () => {
    const titles = ['過去班表20260101~', '過去班表20260101~備份', '過去班表_old'];

    expect(resolveSheetTitle(titles, '過去班表')).toBe('過去班表20260101~');
  });

  it('僅有已封存 sheet、找不到使用中者時，應該 fail closed 拋錯', () => {
    const titles = ['過去班表20250101~20251231', '過去班表20240501~20241231'];

    expect(() => resolveSheetTitle(titles, '過去班表')).toThrow(/找不到使用中的「過去班表」/);
  });

  it('完全沒有前綴相符的 sheet 時，應該拋錯', () => {
    expect(() => resolveSheetTitle(['每日班表'], '過去班表')).toThrow(
      /找不到使用中的「過去班表」/,
    );
  });

  it('換期中途多個使用中 sheet 並存時，應該拋錯而非猜測', () => {
    const titles = ['過去班表20260101~', '過去班表20270101~'];

    expect(() => resolveSheetTitle(titles, '過去班表')).toThrow(
      /找到多個使用中的「過去班表」/,
    );
  });
});

describe('parseSheetsResponse', () => {
  it('應該以 sheet 標題為 key 轉成 Map', () => {
    const raw = {
      sheets: [
        {
          properties: { title: '每日班表' },
          data: [{ rowData: [{ values: [{}] }] }],
        },
        {
          properties: { title: '過去班表' },
          data: [{ rowData: [{ values: [] }, { values: [] }] }],
        },
      ],
    };

    const result = parseSheetsResponse(raw);

    expect([...result.keys()]).toEqual(['每日班表', '過去班表']);
    expect(result.get('每日班表')).toHaveLength(1);
    expect(result.get('過去班表')).toHaveLength(2);
  });

  it('當 sheets 回傳順序顛倒時，仍應以 title 對應到正確資料', () => {
    const ordered = {
      sheets: [
        { properties: { title: '每日班表' }, data: [{ rowData: [{ values: [] }] }] },
        {
          properties: { title: '過去班表' },
          data: [{ rowData: [{ values: [] }, { values: [] }] }],
        },
      ],
    };
    const reversed = { sheets: [...ordered.sheets].reverse() };

    const fromOrdered = parseSheetsResponse(ordered);
    const fromReversed = parseSheetsResponse(reversed);

    // 不論回傳順序，依 title 取值結果一致（#3：不靠陣列索引）
    expect(fromReversed.get('每日班表')).toHaveLength(1);
    expect(fromReversed.get('過去班表')).toHaveLength(2);
    expect(fromReversed.get('每日班表')).toEqual(fromOrdered.get('每日班表'));
    expect(fromReversed.get('過去班表')).toEqual(fromOrdered.get('過去班表'));
  });

  it('應該把同一 sheet 內多個 data 區塊的列攤平合併', () => {
    const raw = {
      sheets: [
        {
          properties: { title: '每日班表' },
          data: [{ rowData: [{ values: [] }] }, { rowData: [{ values: [] }] }],
        },
      ],
    };

    expect(parseSheetsResponse(raw).get('每日班表')).toHaveLength(2);
  });

  it('當 sheet 缺少 data 時，應該回傳空陣列', () => {
    const raw = { sheets: [{ properties: { title: '每日班表' } }] };

    expect(parseSheetsResponse(raw).get('每日班表')).toEqual([]);
  });

  it('應該略過缺少 properties.title 的 sheet', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const raw = {
      sheets: [{ data: [{ rowData: [] }] }, { properties: { title: '每日班表' }, data: [] }],
    };

    const result = parseSheetsResponse(raw);

    expect([...result.keys()]).toEqual(['每日班表']);
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it('當 sheets 不是陣列時，應該拋出帶有路徑資訊的錯誤', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => parseSheetsResponse({ sheets: 'not-an-array' })).toThrow(
      /Google Sheets 回應結構異常/,
    );
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('當缺少 sheets 欄位時，應該拋錯', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => parseSheetsResponse({})).toThrow(/Google Sheets 回應結構異常/);
    errorSpy.mockRestore();
  });
});
