import { describe, expect, it } from 'vitest';
import { transformSheetDataToSchedules } from '../transformer';
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
});
