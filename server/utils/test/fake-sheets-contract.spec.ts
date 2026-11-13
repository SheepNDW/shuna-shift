import { describe, expect, it } from 'vitest';
import {
  CURRENT_SHEET_TITLE,
  FILTER_AGENT,
  FUTURE_OFFSETS,
  HISTORY_SHEET_TITLE,
  SCROLL_TARGET_OFFSET,
  TODAY_AGENTS,
  addDays,
  buildSpreadsheetResponse,
  hasFilterAgent,
  taipeiTodayIso,
} from '~~/test/e2e/fake-sheets/data';
import { parseSheetTitles, parseSheetsResponse, resolveSheetTitle } from '../sheets';
import { calculateAgentStatistics, filterRecentMonths } from '../statistics';
import { transformSheetDataToSchedules } from '../transformer';

/**
 * e2e 用的假 Sheets 資料，必須長得跟真的 `spreadsheets.get` 回應一樣，否則 e2e 測到的
 * 就不是正式的解析流程。這支把假資料直接餵進正式的 parser / transformer：假資料的形狀
 * 走樣時，在這裡就會紅，不必等到 build 完、開瀏覽器才發現整頁是空的。
 */
const TODAY = '2026-03-15';

function schedulesOf(title: string) {
  const raw = buildSpreadsheetResponse([`${title}!A5:C`], TODAY);
  return transformSheetDataToSchedules(parseSheetsResponse(raw).get(title) ?? []);
}

describe('假 Sheets 資料：只要 metadata 的請求', () => {
  it('回傳的標題清單要能解析出唯一一張使用中的歷史班表', () => {
    const titles = parseSheetTitles(buildSpreadsheetResponse([], TODAY));

    expect(titles).toContain(CURRENT_SHEET_TITLE);
    expect(resolveSheetTitle(titles, '過去班表')).toBe(HISTORY_SHEET_TITLE);
  });
});

describe('假 Sheets 資料：當期班表', () => {
  const schedules = schedulesOf(CURRENT_SHEET_TITLE);
  const futureIsos = FUTURE_OFFSETS.map((offset) => addDays(TODAY, offset));

  it('今天那一筆的早晚班探員要與 TODAY_AGENTS 一致', () => {
    const today = schedules.find((schedule) => schedule.date.iso === TODAY);

    expect(today?.day.map((agent) => agent.name)).toEqual(TODAY_AGENTS.day);
    expect(today?.night.map((agent) => agent.name)).toEqual(TODAY_AGENTS.night);
  });

  it('今天起的每一天都要有班，而且最後那列「尚未排班」的白底日期要被濾掉', () => {
    const fromToday = schedules.filter((schedule) => schedule.date.iso >= TODAY);

    expect(fromToday.map((schedule) => schedule.date.iso)).toEqual(futureIsos);
  });

  it('篩選用的探員只在部分日子有班（全有或全無的話，篩選測試就測不出東西）', () => {
    const daysWithFilterAgent = schedules
      .filter((schedule) => schedule.date.iso >= TODAY)
      .filter((schedule) =>
        [...schedule.day, ...schedule.night].some((agent) => agent.name === FILTER_AGENT),
      )
      .map((schedule) => schedule.date.iso);

    expect(daysWithFilterAgent).toEqual(
      FUTURE_OFFSETS.filter(hasFilterAgent).map((offset) => addDays(TODAY, offset)),
    );
    expect(daysWithFilterAgent.length).toBeGreaterThan(0);
    expect(daysWithFilterAgent.length).toBeLessThan(futureIsos.length);
  });

  it('捲動測試的目標日後面要還有好幾天（排在最後的話，頁面捲不到讓它貼齊上緣）', () => {
    const daysAfterTarget = FUTURE_OFFSETS.filter((offset) => offset > SCROLL_TARGET_OFFSET);

    expect(FUTURE_OFFSETS).toContain(SCROLL_TARGET_OFFSET);
    expect(daysAfterTarget.length).toBeGreaterThanOrEqual(5);
  });
});

describe('假 Sheets 資料：歷史班表', () => {
  it('近三個月內要有已發生的班，統計才算得出東西', () => {
    const all = [...schedulesOf(HISTORY_SHEET_TITLE), ...schedulesOf(CURRENT_SHEET_TITLE)];

    const statistics = calculateAgentStatistics(filterRecentMonths(all, 3, TODAY));

    expect(statistics.length).toBeGreaterThan(0);
    expect(statistics.every((entry) => entry.total > 0)).toBe(true);
  });

  it('歷史與當期的日期不重疊，合併後也沒有缺日', () => {
    const isos = [...schedulesOf(HISTORY_SHEET_TITLE), ...schedulesOf(CURRENT_SHEET_TITLE)].map(
      (schedule) => schedule.date.iso,
    );

    const expected = Array.from({ length: isos.length }, (_, index) => addDays(isos[0]!, index));
    expect(isos).toEqual(expected);
  });
});

describe('假 Sheets 資料：其他', () => {
  it('請求了不存在的 sheet 時要拋錯，而不是回一張空表', () => {
    expect(() => buildSpreadsheetResponse(['沒有這張!A5:C'], TODAY)).toThrow(/沒有這張/);
  });

  it('taipeiTodayIso 以台北時區判定：UTC 16:00 之後台北已經是隔天', () => {
    expect(taipeiTodayIso(new Date('2026-03-14T15:59:00Z'))).toBe('2026-03-14');
    expect(taipeiTodayIso(new Date('2026-03-14T16:00:00Z'))).toBe('2026-03-15');
  });

  it('addDays 跨月、跨年都要正確', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});
