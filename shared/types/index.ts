export type Agent = {
  id: string;
  name: string;
  picture: string;
  photos: string[];
  instagram?: string;
  isFullTime?: boolean;
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

/**
 * 每一列 (row)。
 *
 * Sheets API 回應的整體結構（sheets / data / rowData）由 `server/utils/sheets.ts`
 * 的 Zod schema 負責驗證，這裡只保留 `transformer`／`parser` 實際取用的列與儲存格型別。
 * 空列在 API 回應中為 `{}`（無 `values`），故 `values` 為選填。
 */
export interface RowData {
  values?: Cell[];
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

/** 探員值班統計 */
export interface AgentStatistics {
  agentId: string;
  name: string;
  picture: string;
  dayCount: number;
  nightCount: number;
  total: number;
  isFullTime?: boolean;
}

/** 統計 API 回應 */
export interface StatisticsResponse {
  statistics: AgentStatistics[];
  metadata: {
    lastUpdated: string;
    dateRange: {
      from: string;
      to: string;
    };
    totalSchedules: number;
  };
}
