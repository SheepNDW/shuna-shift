export type Agent = {
  name: string;
  picture: string;
  instagram?: string;
};

/** 班表資料結構 */
export interface ShiftSchedule {
  date: {
    datetime: string;
    backgroundColor: string;
    description: string;
  };
  day: { name: string; textColor: string }[];
  night: { name: string; textColor: string }[];
}

/** API 回傳的班表資料（包含 metadata） */
export interface ScheduleResponse {
  schedules: ShiftSchedule[];
  metadata: {
    lastUpdated: string;
  };
}

/** Google Sheets API 回傳的最外層 */
export interface SheetsResponse {
  sheets: Sheet[];
}

/** 每個 sheet 的資料 */
export interface Sheet {
  data: SheetData[];
}

/** 每個資料區塊 (range) */
export interface SheetData {
  rowData: RowData[];
}

/** 每一列 (row) */
export interface RowData {
  values: Cell[];
}

/** 每個儲存格 (cell) */
export interface Cell {
  userEnteredValue?: UserEnteredValue;
  userEnteredFormat?: UserEnteredFormat;
  textFormatRuns?: TextFormatRun[];
}

/** 儲存格的實際值（可為 number / string / bool） */
export interface UserEnteredValue {
  numberValue?: number;
  stringValue?: string;
  boolValue?: boolean;
}

/** 儲存格的格式（背景色、對齊、字型等） */
export interface UserEnteredFormat {
  backgroundColor?: RGBColor;
  textFormat?: TextFormat;
}

/** 顏色結構 */
export interface RGBColor {
  red?: number;
  green?: number;
  blue?: number;
  alpha?: number;
}

/** 文字樣式（例如粗體、斜體、顏色） */
export interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  foregroundColor?: RGBColor;
  foregroundColorStyle?: {
    rgbColor?: RGBColor;
  };
}

/** 局部文字格式變化 */
export interface TextFormatRun {
  startIndex?: number;
  format?: TextFormat;
}
