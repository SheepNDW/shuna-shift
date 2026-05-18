import { describe, expect, it, vi } from 'vitest';
import type { RowData } from '~~/shared/types';
import { isUnscheduledSchedule, transformSheetDataToSchedules } from '../transformer';
import { mockSheetData, mockSheetDataNewMonth } from './fixtures/mockSheetData';
import {
  expectedScheduleData,
  expectedScheduleDataNewMonth,
} from './fixtures/expectedScheduleData';

describe('transformSheetDataToSchedules', () => {
  it('應該正確將原始資料轉換為完整的班表資料', () => {
    const result = transformSheetDataToSchedules(mockSheetData);

    expect(result).toHaveLength(4);
    expect(result).toEqual(expectedScheduleData);
  });

  it('應該正確處理換月時的日期空檔', () => {
    const result = transformSheetDataToSchedules(mockSheetDataNewMonth);

    expect(result).toEqual(expectedScheduleDataNewMonth);
  });

  it('當輸入為空陣列時，應該回傳空陣列', () => {
    const result = transformSheetDataToSchedules([]);

    expect(result).toEqual([]);
  });

  it('應該過濾尚未排班（純白底）的日期，但保留店休（灰底）', () => {
    const white = { red: 1, green: 1, blue: 1 };
    const grey = { red: 0.6, green: 0.6, blue: 0.6 };
    const rows: RowData[] = [
      // 已排班日
      {
        values: [
          { userEnteredValue: { numberValue: 45800 } },
          { userEnteredValue: { stringValue: '早' } },
          { userEnteredValue: { stringValue: '🐷、亞米' } },
        ],
      },
      {
        values: [
          {},
          { userEnteredValue: { stringValue: '晚' } },
          { userEnteredValue: { stringValue: '🐷、芽' } },
        ],
      },
      // 店休日：灰底、兩班皆空
      {
        values: [
          { userEnteredValue: { numberValue: 45801 }, userEnteredFormat: { backgroundColor: grey } },
          { userEnteredValue: { stringValue: '早' } },
          {},
        ],
      },
      { values: [{}, { userEnteredValue: { stringValue: '晚' } }, {}] },
      // 尚未排班：純白底、兩班皆空
      {
        values: [
          {
            userEnteredValue: { numberValue: 45802 },
            userEnteredFormat: { backgroundColor: white },
          },
          { userEnteredValue: { stringValue: '早' } },
          {},
        ],
      },
      { values: [{}, { userEnteredValue: { stringValue: '晚' } }, {}] },
    ];

    const result = transformSheetDataToSchedules(rows);

    // 已排班日 + 店休日保留，尚未排班日被過濾
    expect(result).toHaveLength(2);
    expect(result[1]?.date.backgroundColor).toBe('#999999');
    expect(result[1]?.day).toEqual([]);
    expect(result[1]?.night).toEqual([]);
  });
});

describe('transformSheetDataToSchedules — B 欄班別判定', () => {
  const dateCell = (serial: number) => ({ userEnteredValue: { numberValue: serial } });
  const shiftCell = (shift: string) => ({ userEnteredValue: { stringValue: shift } });
  const agentsCell = (names: string) => ({ userEnteredValue: { stringValue: names } });

  it('某日僅有晚班（單列、有日期、B 欄為「晚」）時，agents 應進 night 而非 day', () => {
    const rows: RowData[] = [
      { values: [dateCell(45800), shiftCell('晚'), agentsCell('🐷、亞米')] },
    ];

    const [schedule] = transformSheetDataToSchedules(rows);

    // 舊的「有日期即早班」推斷會誤放進 day，B 欄為準才正確
    expect(schedule?.day).toEqual([]);
    expect(schedule?.night).toHaveLength(2);
  });

  it('某日僅有早班（單列、有日期、B 欄為「早」）時，agents 應進 day', () => {
    const rows: RowData[] = [
      { values: [dateCell(45800), shiftCell('早'), agentsCell('🐷、亞米')] },
    ];

    const [schedule] = transformSheetDataToSchedules(rows);

    expect(schedule?.day).toHaveLength(2);
    expect(schedule?.night).toEqual([]);
  });

  it('B 欄缺漏時應退回位置推斷：有日期視為早班、無日期視為晚班', () => {
    const rows: RowData[] = [
      { values: [dateCell(45800), {}, agentsCell('🐷')] },
      { values: [{}, {}, agentsCell('亞米')] },
    ];

    const [schedule] = transformSheetDataToSchedules(rows);

    expect(schedule?.day).toHaveLength(1);
    expect(schedule?.night).toHaveLength(1);
  });

  it('晚班列在前、早班列在後（次序顛倒）時，仍以 B 欄為準分配', () => {
    const rows: RowData[] = [
      { values: [dateCell(45800), shiftCell('晚'), agentsCell('🐷、亞米')] },
      { values: [{}, shiftCell('早'), agentsCell('芽')] },
    ];

    const [schedule] = transformSheetDataToSchedules(rows);

    expect(schedule?.day).toHaveLength(1);
    expect(schedule?.night).toHaveLength(2);
  });

  it('同一天同班別出現多列時，應警告並以後者覆寫', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const rows: RowData[] = [
      { values: [dateCell(45800), shiftCell('早'), agentsCell('🐷')] },
      { values: [{}, shiftCell('晚'), agentsCell('亞米')] },
      { values: [{}, shiftCell('晚'), agentsCell('芽')] }, // 第二個晚班列
    ];

    const [schedule] = transformSheetDataToSchedules(rows);

    expect(schedule?.night).toHaveLength(1);
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });
});

describe('isUnscheduledSchedule', () => {
  const emptySchedule = (
    backgroundColor: string,
    description = '',
  ): ShiftSchedule => ({
    date: { datetime: '6月1日', backgroundColor, description },
    day: [],
    night: [],
  });

  it('純白底且兩班皆空、無描述時，視為尚未排班', () => {
    expect(isUnscheduledSchedule(emptySchedule('#ffffff'))).toBe(true);
  });

  it('店休日（灰底）不視為尚未排班', () => {
    expect(isUnscheduledSchedule(emptySchedule('#999999'))).toBe(false);
  });

  it('純白底但帶有節日描述時，不視為尚未排班', () => {
    expect(isUnscheduledSchedule(emptySchedule('#ffffff', '端午節'))).toBe(false);
  });

  it('有排班時，不視為尚未排班', () => {
    const schedule: ShiftSchedule = {
      date: { datetime: '6月1日', backgroundColor: '#ffffff', description: '' },
      day: [{ name: '🐷', textColor: '' }],
      night: [],
    };
    expect(isUnscheduledSchedule(schedule)).toBe(false);
  });
});
