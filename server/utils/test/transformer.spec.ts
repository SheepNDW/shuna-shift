import { describe, expect, it } from 'vitest';
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
