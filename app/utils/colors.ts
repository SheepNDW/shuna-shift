// 班表「探員文字色」對照 —— 晚班時段(綠 / 橘)與代 / 換班(紅 / 藍)的色碼與判讀工具。

const GREEN_SHIFT = '#93c47d';
const ORANGE_SHIFT = '#ff9900';

export const NIGHT_SHIFT_COLOR_MAP = {
  /** 綠班 */
  GREEN_SHIFT,
  /** 橘班 */
  ORANGE_SHIFT,
};

// 代班 / 換班的探員文字色 —— 必須與 parser `rgbToHex` 對試算表紅 / 藍字的輸出
// 完全相等,否則 AgentScheduleCard 永遠比對不到、代班 / 換班標記不顯示。
// 校正自實際試算表(過去班表 2024–2025 共 8 筆換班):紅 #ff0000、
// 藍 #1155cc(Google Sheets 標準深藍)。回歸測試見 test/unit/colors.spec.ts。
const SUBSTITUTE_TEXT = '#ff0000';
const EXCHANGE_TEXT = '#1155cc';

/**
 * 班表中以探員文字顏色標記的特殊出勤。
 * AgentScheduleCard 用來判定 substituteType，ColorLegend 用於圖例對照。
 */
export const SUBSTITUTE_COLOR_MAP = {
  /** 代班：班表中的紅字 */
  SUBSTITUTE: SUBSTITUTE_TEXT,
  /** 換班：班表中的藍字 */
  EXCHANGE: EXCHANGE_TEXT,
};

/**
 * 根據晚班文字顏色判斷時間段
 * @param textColor 晚班探員的文字顏色
 * @returns 時間段字串
 */
export function getNightShiftTime(textColor: string): string {
  if (textColor === NIGHT_SHIFT_COLOR_MAP.GREEN_SHIFT) {
    return '15:00 ~ 19:30';
  }
  if (textColor === NIGHT_SHIFT_COLOR_MAP.ORANGE_SHIFT) {
    return '16:00 ~ 21:30';
  }
  return '17:30 ~ 21:30';
}

/**
 * 根據晚班文字顏色判斷圖示顏色
 * @param textColor 晚班探員的文字顏色
 * @returns 圖示顏色
 */
export function getNightShiftIconColor(textColor: string): string {
  if (textColor === NIGHT_SHIFT_COLOR_MAP.GREEN_SHIFT) {
    return NIGHT_SHIFT_COLOR_MAP.GREEN_SHIFT;
  }
  if (textColor === NIGHT_SHIFT_COLOR_MAP.ORANGE_SHIFT) {
    return NIGHT_SHIFT_COLOR_MAP.ORANGE_SHIFT;
  }
  return ''; // 一般晚班不設定顏色，使用預設的 text-gray-900
}
