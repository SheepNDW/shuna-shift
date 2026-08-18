export type Agent = {
  id: string;
  name: string;
  /**
   * AGENT FILE 編號，探員頁的檔案章會顯示它（`No. 003`）。
   *
   * 刻意寫死而非由 `AGENTS` 的插入順序推導：那樣在中間插入一位探員，
   * 其後所有人的編號都會跟著位移 —— 而這個欄位在畫面上被呈現成「檔案編號」，
   * 讀起來是身分的一部分，不該因為別人加入而改變。
   * 新增探員時取目前最大值 +1，不要重用離開者的號碼。
   */
  fileNo: number;
  picture: string;
  photos: string[];
  instagram?: string;
  isFullTime?: boolean;
  /** 是否為卒業探員（已離開朱雫）。未設定視為在職。 */
  isGraduated?: boolean;
  /** 班表中代表此探員的 emoji（正職探員適用），用於自動建立 emoji → 名稱查表 */
  emoji?: string;
  /** 色彩編號：代表色，照原樣字串顯示（例如「群青 ｸﾞﾝｼﾞｮｳ」） */
  themeColor?: string;
  /** 生日（MM.DD 格式字串，例如 "02.20"） */
  birthday?: string;
  /** 特技專長 */
  skills?: string[];
  /** 興趣喜好 */
  hobbies?: string[];
  /** 個人金句 / 自我介紹短語 */
  quote?: string;
};

/**
 * `createError` 的 `data` 中，唯一會被 `app/error.vue` 呈現給使用者的欄位。
 *
 * 有型別而不只是註解，是因為這個契約的失效方式是靜默的：欄位名打成 `usermessage`
 * 或 `message`，TypeScript 從物件字面值推導 `DataT`、沒有目標形狀可比對，編譯照過，
 * 錯誤頁只是安靜地退回泛用文案。呼叫端寫成 `createError<UserFacingErrorData>({...})`
 * 就把它變成編譯期錯誤。
 *
 * 錯誤頁那側仍要做 runtime narrowing —— 錯誤物件會經過 SSR 序列化，也可能來自
 * 沒帶這個欄位的地方（Nuxt router 的 404、上游 fetch 失敗）。
 */
export interface UserFacingErrorData {
  /** 給使用者看的說明文字 */
  userMessage: string;
}

/** 班表資料結構 */
export interface ShiftSchedule {
  date: {
    /**
     * ISO 日期（`yyyy-mm-dd`），由 Excel 日期序號直接產生 —— 排序、範圍過濾與
     * 「今天／未來」判斷一律以此為準。
     *
     * 到達此型別時保證非空：A 欄無日期序號的列在 `ParsedRow` 階段 `iso` 為空字串，
     * 而 `mergeDayAndNightShifts` 只在 `iso` 有值時才開一筆 `ShiftSchedule`。
     */
    iso: string;
    /**
     * 顯示用日期標籤（`8月31日`），由 `iso` 格式化而來。
     * 不帶年份，故不可用於比較、排序或當作 key。
     */
    datetime: string;
    backgroundColor: string;
    description: string;
  };
  day: { name: string; textColor: string }[];
  night: { name: string; textColor: string }[];
}

/**
 * 一個可跳轉的日期：`iso` 作為識別與比較依據，`label` 僅用於顯示。
 * 用於 `/shifts` 的日期快速跳轉（`shifts.vue` → `FilterBar`）。
 */
export interface JumpDate {
  /** ISO 日期（格式：2026-08-31） */
  iso: string;
  /** 顯示用日期標籤（格式：10月12日） */
  label: string;
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
