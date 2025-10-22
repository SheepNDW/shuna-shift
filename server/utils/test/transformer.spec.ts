import { describe, expect, it } from 'vitest';
import { transformSheetDataToSchedules } from '../transformer';
import { mockSheetData } from './fixtures/mockSheetData';
import { expectedScheduleData } from './fixtures/expectedScheduleData';

describe('transformSheetDataToSchedules', () => {
  it('應該正確將原始資料轉換為完整的班表資料', () => {
    const result = transformSheetDataToSchedules(mockSheetData);

    expect(result).toHaveLength(4);
    expect(result).toEqual(expectedScheduleData);
  });

  it('當輸入為空陣列時，應該回傳空陣列', () => {
    const result = transformSheetDataToSchedules([]);

    expect(result).toEqual([]);
  });
});
