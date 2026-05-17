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

/**
 * 將 Google Sheets 的原始行資料轉換為結構化的日期和資訊
 */
export function transformRowToParsedData(row: RowData): ParsedRow {
  const cells = row.values ?? [];

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
      name: cells[2]?.userEnteredValue?.stringValue?.trim() ?? '',
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
    } else if (curr.agents.name) {
      // 沒有日期但有班表資料，表示這是晚班資料，合併到前一筆
      const last = acc[acc.length - 1];
      if (last) {
        last.night = parseAgents(curr.agents.name, curr.agents.textFormatRuns);
        // 只有當早班沒有 description 時，才使用晚班的 description
        if (!last.date.description && curr.date.description) {
          last.date.description = curr.date.description;
        }
      }
    }
    // 如果既沒有日期也沒有班表資料（例如換月標記），則跳過
    return acc;
  }, []);
}

/**
 * 表單會把未來日期格預先以純白底填好，待實際排班時才上色。
 * 因此「純白底」是「尚未排班」獨有的訊號（歷史班表中完全不出現白底）。
 */
const UNSCHEDULED_BACKGROUND = '#ffffff';

/**
 * 判斷是否為「尚未排班」的日期：兩班皆無人、無節日標記，且為純白底。
 *
 * 店休日（灰底 `#999999`）與節日（帶 description）雖然也可能兩班無人，
 * 但屬於有意義的排班資訊，不應被視為尚未排班。
 */
export function isUnscheduledSchedule(schedule: ShiftSchedule): boolean {
  return (
    schedule.day.length === 0 &&
    schedule.night.length === 0 &&
    schedule.date.description === '' &&
    schedule.date.backgroundColor === UNSCHEDULED_BACKGROUND
  );
}

/**
 * 將 Google Sheets API 的原始資料轉換為班表資料。
 *
 * 開放式範圍會一併讀到表單預先填好、但尚未排班的未來日期列，
 * 這些列在此過濾掉，只保留實際已排班與店休／節日等有意義的日期。
 */
export function transformSheetDataToSchedules(rows: RowData[]): ShiftSchedule[] {
  const parsedRows = rows.map(transformRowToParsedData);
  return mergeDayAndNightShifts(parsedRows).filter(
    (schedule) => !isUnscheduledSchedule(schedule),
  );
}
