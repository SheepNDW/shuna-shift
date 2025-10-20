import type { RowData, TextFormatRun } from '~~/shared/types';
import { excelSerialToDateLabel, parseAgents, rgbToHex } from './parser';

export interface ParsedRow {
  date: {
    datetime: string;
    backgroundColor: string;
    description: string;
  };
  agents: {
    name: string;
    textFormatRuns: TextFormatRun[];
  };
}

export interface ShiftSchedule {
  date: {
    datetime: string;
    backgroundColor: string;
    description: string;
  };
  day: { name: string; textColor: string }[];
  night: { name: string; textColor: string }[];
}

/**
 * 將 Google Sheets 的原始行資料轉換為結構化的日期和代理資訊
 */
export function transformRowToParsedData(row: RowData): ParsedRow {
  const cells = row.values;

  return {
    date: {
      datetime: cells[0]?.userEnteredValue?.numberValue
        ? excelSerialToDateLabel(cells[0].userEnteredValue.numberValue)
        : '',
      backgroundColor: cells[0]?.userEnteredFormat?.backgroundColor
        ? rgbToHex(cells[0].userEnteredFormat.backgroundColor)
        : '',
      description: cells[0]?.userEnteredValue?.stringValue ?? '',
    },
    agents: {
      name: cells[2]?.userEnteredValue?.stringValue ?? '',
      textFormatRuns: cells[2]?.textFormatRuns ?? [],
    },
  };
}

/**
 * 合併早班與晚班資料
 * 晚班的 row 沒有 datetime，遇到沒有 datetime 的就插入到前一筆資料的 night 欄位
 */
export function mergeDayAndNightShifts(parsedRows: ParsedRow[]): ShiftSchedule[] {
  return parsedRows.reduce<ShiftSchedule[]>((acc, curr) => {
    if (curr.date.datetime) {
      // 有日期表示這是早班資料
      acc.push({
        date: {
          datetime: curr.date.datetime,
          backgroundColor: curr.date.backgroundColor,
          description: curr.date.description,
        },
        day: parseAgents(curr.agents.name, curr.agents.textFormatRuns),
        night: [],
      });
    } else {
      // 沒有日期表示這是晚班資料，合併到前一筆
      const last = acc[acc.length - 1];
      if (last) {
        last.night = parseAgents(curr.agents.name, curr.agents.textFormatRuns);
        last.date.description = curr.date.description;
      }
    }
    return acc;
  }, []);
}

/**
 * 將 Google Sheets API 的原始資料轉換為班表資料
 */
export function transformSheetDataToSchedules(rows: RowData[]): ShiftSchedule[] {
  const parsedRows = rows.map(transformRowToParsedData);
  return mergeDayAndNightShifts(parsedRows);
}
