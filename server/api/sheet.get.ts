import type { ScheduleResponse } from '~~/shared/types';
import { transformSheetDataToSchedules } from '../utils/transformer';
import { fetchSheetRanges, sheetTitleFromRange } from '../utils/sheets';
import { defineCdnCachedEventHandler } from '../utils/cache';

/** 當期班表範圍：開放式結束列，多排幾天也不會被截斷 */
const CURRENT_SHEET_RANGE = '每日班表!A5:C';

export default defineCdnCachedEventHandler(
  async (_event) => {
    try {
      console.log('fetch Sheets...');
      const sheetData = await fetchSheetRanges([CURRENT_SHEET_RANGE]);
      const rows = sheetData.get(sheetTitleFromRange(CURRENT_SHEET_RANGE)) ?? [];

      const schedules = transformSheetDataToSchedules(rows);

      return {
        schedules,
        metadata: {
          lastUpdated: new Date().toISOString(),
        },
      } satisfies ScheduleResponse;
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error instanceof Error ? error.message : 'Failed to fetch sheets',
      });
    }
  },
  {
    name: 'sheet-get',
    // Cache for 3 hours
    maxAge: 60 * 60 * 3,
  }
);
