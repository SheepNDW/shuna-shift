import type { SheetsResponse, ScheduleResponse } from '~~/shared/types';
import { transformSheetDataToSchedules } from '../utils/transformer';

export default defineCachedEventHandler(
  async (_event) => {
    const config = useRuntimeConfig();
    const { gsheetsKey, spreadsheetId } = config;

    if (!gsheetsKey || !spreadsheetId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing google sheets key or spreadsheet id',
      });
    }

    const ranges = ['每日班表!A5:C45'].join(',');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?ranges=${encodeURIComponent(
      ranges
    )}&fields=sheets.data.rowData.values(userEnteredValue,userEnteredFormat.backgroundColor,textFormatRuns)&key=${gsheetsKey}`;

    try {
      console.log('fetch Sheets...');
      const res = await $fetch<SheetsResponse>(url);
      const rows = res?.sheets[0]?.data[0]?.rowData ?? [];

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
