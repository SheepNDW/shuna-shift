import type { SheetsResponse } from '~~/shared/types';
import { transformSheetDataToSchedules } from '../utils/transformer';

export default defineEventHandler(async (_event) => {
  const config = useRuntimeConfig();
  const { gsheetsKey, spreadsheetId } = config;

  if (!gsheetsKey || !spreadsheetId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing google sheets key or spreadsheet id',
    });
  }

  const ranges = ['每日班表!A5:C43'].join(',');

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?ranges=${encodeURIComponent(
    ranges
  )}&fields=sheets.data.rowData.values(userEnteredValue,userEnteredFormat.backgroundColor,textFormatRuns)&key=${gsheetsKey}`;

  try {
    const res = await $fetch<SheetsResponse>(url);
    const rows = res?.sheets[0]?.data[0]?.rowData ?? [];

    return transformSheetDataToSchedules(rows);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to fetch sheets',
    });
  }
});
