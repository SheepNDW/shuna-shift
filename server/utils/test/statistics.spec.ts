import { describe, expect, it } from 'vitest';
import type { RowData, ShiftSchedule } from '~~/shared/types';
import {
  calculateAgentStatistics,
  extractAgentName,
  filterRecentMonths,
  findAgentByName,
  getDateRange,
  getLastScheduleDate,
  parseDateString,
} from '../statistics';
import { transformSheetDataToSchedules } from '../transformer';

describe('extractAgentName', () => {
  it('應該回傳原始名稱（無括號）', () => {
    expect(extractAgentName('泠泠')).toBe('泠泠');
    expect(extractAgentName('Luna')).toBe('Luna');
  });

  it('應該提取括號前的名稱（代班情況）', () => {
    expect(extractAgentName('小楓(泠泠)')).toBe('小楓');
    expect(extractAgentName('音（Luna）')).toBe('音');
  });

  it('應該處理名稱前後有空格的情況', () => {
    expect(extractAgentName(' 泠泠 ')).toBe('泠泠');
    expect(extractAgentName('小楓 (泠泠)')).toBe('小楓');
  });
});

describe('findAgentByName', () => {
  it('應該根據名稱找到對應的探員', () => {
    const agent = findAgentByName('泠泠');
    expect(agent).not.toBeNull();
    expect(agent?.id).toBe('rin');
    expect(agent?.name).toBe('泠泠');
    expect(agent?.isFullTime).toBe(true);
  });

  it('應該根據 emoji key 找到對應的正職探員', () => {
    const agent = findAgentByName('🐷');
    expect(agent).not.toBeNull();
    expect(agent?.id).toBe('rin');
    expect(agent?.name).toBe('泠泠');
    expect(agent?.isFullTime).toBe(true);
  });

  it('應該根據 emoji key 找到米捲', () => {
    const agent = findAgentByName('🥨');
    expect(agent).not.toBeNull();
    expect(agent?.id).toBe('juano');
    expect(agent?.name).toBe('米捲');
  });

  it('應該根據 emoji key 找到 Luna', () => {
    const agent = findAgentByName('🌙');
    expect(agent).not.toBeNull();
    expect(agent?.id).toBe('luna');
    expect(agent?.name).toBe('Luna');
  });

  it('當找不到探員時應該回傳 null', () => {
    const agent = findAgentByName('不存在的探員');
    expect(agent).toBeNull();
  });
});

describe('parseDateString', () => {
  it('應該正確解析日期字串', () => {
    const referenceDate = new Date(2025, 11, 16);
    const result = parseDateString('12月16日', referenceDate);

    expect(result?.getFullYear()).toBe(2025);
    expect(result?.getMonth()).toBe(11);
    expect(result?.getDate()).toBe(16);
  });

  it('應該正確處理跨年的情況（月份大於參考日期）', () => {
    const referenceDate = new Date(2025, 1, 15); // 2月
    const result = parseDateString('11月15日', referenceDate);

    expect(result?.getFullYear()).toBe(2024);
    expect(result?.getMonth()).toBe(10);
  });

  it('無效日期字串應該回傳 null', () => {
    const result = parseDateString('無效日期');
    expect(result).toBeNull();
  });
});

describe('getLastScheduleDate', () => {
  const createSchedule = (datetime: string): ShiftSchedule => ({
    date: { datetime, backgroundColor: '', description: '' },
    day: [],
    night: [],
  });

  it('應該回傳最後一筆資料的日期', () => {
    const schedules = [
      createSchedule('9月16日'),
      createSchedule('10月1日'),
      createSchedule('12月16日'),
    ];

    const result = getLastScheduleDate(schedules);

    expect(result?.getMonth()).toBe(11);
    expect(result?.getDate()).toBe(16);
  });

  it('空陣列應該回傳 null', () => {
    const result = getLastScheduleDate([]);
    expect(result).toBeNull();
  });
});

describe('filterRecentMonths', () => {
  const createSchedule = (datetime: string): ShiftSchedule => ({
    date: { datetime, backgroundColor: '', description: '' },
    day: [],
    night: [],
  });

  it('應該回傳空陣列（當輸入為空）', () => {
    const result = filterRecentMonths([], 3);
    expect(result).toEqual([]);
  });

  it('應該篩選出近 N 個月的資料（指定參考日期）', () => {
    const referenceDate = new Date(2025, 11, 16); // 2025年12月16日
    const schedules = [
      createSchedule('9月1日'), // 超過 3 個月
      createSchedule('9月16日'), // 剛好 3 個月
      createSchedule('10月1日'),
      createSchedule('11月1日'),
      createSchedule('12月16日'),
    ];

    const result = filterRecentMonths(schedules, 3, referenceDate);

    expect(result.length).toBe(4);
    expect(result[0]?.date.datetime).toBe('9月16日');
    expect(result[result.length - 1]?.date.datetime).toBe('12月16日');
  });

  it('預設應該以資料最後一筆為參考日期', () => {
    const schedules = [
      createSchedule('9月1日'),
      createSchedule('9月16日'),
      createSchedule('10月1日'),
      createSchedule('11月1日'),
      createSchedule('12月16日'), // 最後一筆
    ];

    // 不傳入 referenceDate，應該以最後一筆 12月16日 為基準
    const result = filterRecentMonths(schedules, 3);

    expect(result.length).toBe(4);
    expect(result[0]?.date.datetime).toBe('9月16日');
  });

  it('應該排除超過參考日期的資料', () => {
    const referenceDate = new Date(2025, 11, 10); // 12月10日
    const schedules = [
      createSchedule('9月16日'),
      createSchedule('10月1日'),
      createSchedule('12月10日'),
      createSchedule('12月16日'), // 超過參考日期
    ];

    const result = filterRecentMonths(schedules, 3, referenceDate);

    expect(result.length).toBe(3);
    expect(result[result.length - 1]?.date.datetime).toBe('12月10日');
  });

  it('應該正確處理跨年的情況', () => {
    const referenceDate = new Date(2025, 1, 15); // 2025年2月15日
    const schedules = [
      createSchedule('10月1日'), // 2024年10月
      createSchedule('11月15日'), // 剛好 3 個月
      createSchedule('12月1日'), // 2024年12月
      createSchedule('1月1日'), // 2025年1月
      createSchedule('2月15日'), // 2025年2月
    ];

    const result = filterRecentMonths(schedules, 3, referenceDate);

    expect(result.length).toBe(4);
    expect(result[0]?.date.datetime).toBe('11月15日');
  });
});

describe('calculateAgentStatistics', () => {
  const createSchedule = (
    datetime: string,
    dayAgents: string[],
    nightAgents: string[],
  ): ShiftSchedule => ({
    date: { datetime, backgroundColor: '', description: '' },
    day: dayAgents.map((name) => ({ name, textColor: '' })),
    night: nightAgents.map((name) => ({ name, textColor: '' })),
  });

  it('應該回傳空陣列（當輸入為空）', () => {
    const result = calculateAgentStatistics([]);
    expect(result).toEqual([]);
  });

  it('應該正確統計各探員的班次', () => {
    const schedules = [
      createSchedule('12月1日', ['泠泠', 'Luna'], ['米捲']),
      createSchedule('12月2日', ['泠泠'], ['Luna', '米捲']),
      createSchedule('12月3日', ['米捲'], ['泠泠']),
    ];

    const result = calculateAgentStatistics(schedules);

    const rin = result.find((s) => s.agentId === 'rin');
    expect(rin?.dayCount).toBe(2);
    expect(rin?.nightCount).toBe(1);
    expect(rin?.total).toBe(3);

    const luna = result.find((s) => s.agentId === 'luna');
    expect(luna?.dayCount).toBe(1);
    expect(luna?.nightCount).toBe(1);
    expect(luna?.total).toBe(2);

    const juano = result.find((s) => s.agentId === 'juano');
    expect(juano?.dayCount).toBe(1);
    expect(juano?.nightCount).toBe(2);
    expect(juano?.total).toBe(3);
  });

  it('應該按總班次降序排列', () => {
    const schedules = [
      createSchedule('12月1日', ['泠泠', 'Luna'], ['米捲']),
      createSchedule('12月2日', ['泠泠'], ['米捲']),
    ];

    const result = calculateAgentStatistics(schedules);

    expect(result[0]?.total).toBeGreaterThanOrEqual(result[1]?.total ?? 0);
  });

  it('應該處理代班名稱（括號情況）', () => {
    const schedules = [createSchedule('12月1日', ['小楓(泠泠)'], ['音（Luna）'])];

    const result = calculateAgentStatistics(schedules);

    const mepuru = result.find((s) => s.agentId === 'mepuru');
    expect(mepuru?.dayCount).toBe(1);
    expect(mepuru?.total).toBe(1);

    const non = result.find((s) => s.agentId === 'non');
    expect(non?.nightCount).toBe(1);
    expect(non?.total).toBe(1);
  });

  it('應該忽略找不到對應的探員', () => {
    const schedules = [createSchedule('12月1日', ['不存在的探員'], ['泠泠'])];

    const result = calculateAgentStatistics(schedules);

    expect(result.length).toBe(1);
    expect(result[0]?.agentId).toBe('rin');
  });
});

describe('getDateRange', () => {
  const createSchedule = (datetime: string): ShiftSchedule => ({
    date: { datetime, backgroundColor: '', description: '' },
    day: [],
    night: [],
  });

  it('應該回傳實際資料的日期範圍', () => {
    const schedules = [
      createSchedule('9月16日'),
      createSchedule('10月1日'),
      createSchedule('11月1日'),
      createSchedule('12月16日'),
    ];

    const result = getDateRange(schedules);

    expect(result.from).toBe('9月16日');
    expect(result.to).toBe('12月16日');
  });

  it('應該正確處理跨年的情況', () => {
    const schedules = [
      createSchedule('11月15日'),
      createSchedule('12月1日'),
      createSchedule('1月1日'),
      createSchedule('2月15日'),
    ];

    const result = getDateRange(schedules);

    expect(result.from).toBe('11月15日');
    expect(result.to).toBe('2月15日');
  });

  it('空陣列應該回傳空字串', () => {
    const result = getDateRange([]);

    expect(result.from).toBe('');
    expect(result.to).toBe('');
  });

  it('應該處理單筆資料', () => {
    const schedules = [createSchedule('12月16日')];

    const result = getDateRange(schedules);

    expect(result.from).toBe('12月16日');
    expect(result.to).toBe('12月16日');
  });
});

describe('蜜柑 emoji 與文字名稱的統計整合', () => {
  // 建立含日期（早班）的原始 row：A 欄為 Excel 日期序號，C 欄為人員名稱
  const createDayRow = (dateSerial: number, agents: string): RowData => ({
    values: [
      { userEnteredValue: { numberValue: dateSerial } },
      {},
      { userEnteredValue: { stringValue: agents } },
    ],
  });

  it('應該將 🍊 與「蜜柑」的班次併入同一位探員', () => {
    // 蜜柑轉正職後的班次以 🍊 標示，轉正職前則為文字「蜜柑」
    const rows: RowData[] = [
      createDayRow(45292, '🍊'), // 轉正職後
      createDayRow(45293, '蜜柑'), // 轉正職前
    ];

    const schedules = transformSheetDataToSchedules(rows);
    const result = calculateAgentStatistics(schedules);

    expect(result.length).toBe(1);
    expect(result[0]?.agentId).toBe('mikan');
    expect(result[0]?.dayCount).toBe(2);
    expect(result[0]?.total).toBe(2);
    expect(result[0]?.isFullTime).toBe(true);
  });
});
