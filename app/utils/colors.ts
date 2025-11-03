const SPECIAL_DAY = '#b6d7a8';
const EVENT_WEEK = '#a4c2f4';
const BIRTHDAY = '#d5a6bd';
const CLOSED = '#999999';

export const DATE_COLOR_MAP = {
  /** 一日限定 */
  SPECIAL_DAY,
  /** 活動週 */
  EVENT_WEEK,
  /** 生誕祭/生誕出勤 */
  BIRTHDAY,
  /** 店休 */
  CLOSED,
};

const GREEN_SHIFT = '#93c47d';
const ORANGE_SHIFT = '#ff9900';

export const NIGHT_SHIFT_COLOR_MAP = {
  /** 綠班 */
  GREEN_SHIFT,
  /** 橘班 */
  ORANGE_SHIFT,
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
