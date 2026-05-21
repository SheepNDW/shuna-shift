import {
  excelSerialToDateLabel,
  parseAgents,
  parseShiftType,
  rgbToHex,
  type ShiftType,
} from './parser';
import { getSpecialDateKind, getSpecialDateLabel } from '~~/shared/date-meta';

export interface ParsedRow {
  date: {
    datetime: string;
    backgroundColor: string;
    description: string;
  };
  /** 由 B 欄判定的班別 */
  shiftType: ShiftType;
  agents: {
    name: string;
    textFormatRuns: TextFormatRun[];
  };
}

/**
 * 將 Google Sheets 的原始行資料轉換為結構化的日期、班別與班表資訊。
 * 對應欄位：A 欄日期、B 欄班別（早／晚）、C 欄當班探員。
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
    shiftType: parseShiftType(cells[1]?.userEnteredValue?.stringValue),
    agents: {
      name: cells[2]?.userEnteredValue?.stringValue?.trim() ?? '',
      textFormatRuns: cells[2]?.textFormatRuns ?? [],
    },
  };
}

/**
 * 將解析後的列資料合併為各日班表。
 *
 * 有日期的列開啟新的一天，後續無日期的列接續同一天。
 * 班別（早／晚）以 B 欄為準（{@link ParsedRow.shiftType}）；B 欄缺漏時
 * 退回位置推斷 —— 有日期者視為早班、無日期者視為晚班。
 */
export function mergeDayAndNightShifts(parsedRows: ParsedRow[]): ShiftSchedule[] {
  return parsedRows.reduce<ShiftSchedule[]>((acc, curr) => {
    const agents = parseAgents(curr.agents.name, curr.agents.textFormatRuns);

    if (curr.date.datetime) {
      // 有日期：開啟新的一天。班別以 B 欄為準，缺漏時預設早班
      const schedule: ShiftSchedule = {
        date: {
          datetime: curr.date.datetime,
          backgroundColor: curr.date.backgroundColor,
          description: curr.date.description,
        },
        day: [],
        night: [],
      };
      if (curr.shiftType === 'night') {
        schedule.night = agents;
      } else {
        schedule.day = agents;
      }
      acc.push(schedule);
    } else if (curr.agents.name) {
      // 無日期但有班表資料：接續前一天。班別以 B 欄為準，缺漏時預設晚班
      const last = acc[acc.length - 1];
      if (last) {
        const shift = curr.shiftType === 'day' ? 'day' : 'night';
        // 同一天同班別出現多列代表表單填寫異常，覆寫前先示警，避免靜默遺失資料
        if (last[shift].length > 0) {
          console.warn(
            `[transformer] ${last.date.datetime} 的${
              shift === 'day' ? '早' : '晚'
            }班被多列資料覆寫，請檢查表單`,
          );
        }
        last[shift] = agents;
        // 早班若無 description，沿用此列的 description
        if (!last.date.description && curr.date.description) {
          last.date.description = curr.date.description;
        }
      }
    }
    // 既無日期也無班表資料（例如換月標記）則跳過
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
 * 把特殊日分類補進 `date.description`，讓活動週 / 一日限定 / 生誕祭以文字呈現，
 * 不必再靠日期格底色判讀。格式為「分類・原說明」，原本無說明時則僅保留分類。
 * 店休不在此處理 —— 由前端卡片以「休」印章呈現。
 */
function withSpecialDateDescription(schedule: ShiftSchedule): ShiftSchedule {
  const kind = getSpecialDateKind(schedule.date.backgroundColor);
  if (!kind || kind === 'closed') return schedule;

  const label = getSpecialDateLabel(kind);
  const original = schedule.date.description;
  const description = original ? `${label}・${original}` : label;

  return { ...schedule, date: { ...schedule.date, description } };
}

/**
 * 將 Google Sheets API 的原始資料轉換為班表資料。
 *
 * 開放式範圍會一併讀到表單預先填好、但尚未排班的未來日期列，
 * 這些列在此過濾掉，只保留實際已排班與店休／節日等有意義的日期；
 * 最後把特殊日分類補進 description。
 */
export function transformSheetDataToSchedules(rows: RowData[]): ShiftSchedule[] {
  const parsedRows = rows.map(transformRowToParsedData);
  return mergeDayAndNightShifts(parsedRows)
    .filter((schedule) => !isUnscheduledSchedule(schedule))
    .map(withSpecialDateDescription);
}
