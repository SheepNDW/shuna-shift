export default defineEventHandler(async (_event) => {
  const config = useRuntimeConfig();
  const { gsheetsKey, spreadsheetId } = config;

  if (!gsheetsKey || !spreadsheetId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing google sheets key or spreadsheet id',
    });
  }

  const targetSheets = ['每日班表', '過去班表20250101~'];

  // 使用 Google Sheets API 的 batchGet 一次拉取多個 sheet
  const ranges = targetSheets.map((sheet) => encodeURIComponent(sheet)).join('&ranges=');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${ranges}&key=${gsheetsKey}`;

  try {
    const data = await $fetch<{
      spreadsheetId: string;
      valueRanges: Array<{
        range: string;
        majorDimension: string;
        values?: string[][];
      }>;
    }>(url);

    const sheets = data.valueRanges.map((valueRange, index) => ({
      sheetName: targetSheets[index],
      values: valueRange.values || [],
      success: true,
    }));

    return {
      sheets,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to fetch sheets',
    });
  }
});
