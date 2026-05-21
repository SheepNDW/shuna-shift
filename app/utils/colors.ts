import { DATE_BACKGROUND } from '~~/shared/date-meta';

// 日期顏色對照（供 ColorLegend debug 元件）；色碼單一真實來源為 shared/date-meta。
export const DATE_COLOR_MAP = {
  /** 一日限定 */
  SPECIAL_DAY: DATE_BACKGROUND.SPECIAL_DAY,
  /** 活動週 */
  EVENT_WEEK: DATE_BACKGROUND.EVENT_WEEK,
  /** 生誕祭/生誕出勤 */
  BIRTHDAY: DATE_BACKGROUND.BIRTHDAY,
  /** 店休 */
  CLOSED: DATE_BACKGROUND.CLOSED,
};

const GREEN_SHIFT = '#93c47d';
const ORANGE_SHIFT = '#ff9900';

export const NIGHT_SHIFT_COLOR_MAP = {
  /** 綠班 */
  GREEN_SHIFT,
  /** 橘班 */
  ORANGE_SHIFT,
};

const SUBSTITUTE_TEXT = '#ef4444';
const EXCHANGE_TEXT = '#3b82f6';

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
