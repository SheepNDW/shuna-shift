// 班表「探員文字色」對照 —— 晚班時段(綠 / 橘)與代 / 換班(紅 / 藍)的色碼與判讀工具。

const GREEN_SHIFT = '#93c47d';
const ORANGE_SHIFT = '#ff9900';

// 晚班綠時段可能出現的相近綠 —— 班表填寫者用色卡時偶爾選到不同綠:
// #93c47d 是 Google Sheets 調色盤淺綠、#70ad47 是 MS Office 綠,兩者
// 皆指同一個綠時段(15:00 ~ 19:30)。日後再出現填錯的相近綠補進此陣列即可。
const GREEN_SHIFT_ALIASES = [GREEN_SHIFT, '#70ad47'];

function isGreenShift(textColor: string): boolean {
  return GREEN_SHIFT_ALIASES.includes(textColor);
}

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
  if (isGreenShift(textColor)) {
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
  // 任一綠別名都正規化回 canonical 綠,讓圖示色一致
  if (isGreenShift(textColor)) {
    return NIGHT_SHIFT_COLOR_MAP.GREEN_SHIFT;
  }
  if (textColor === NIGHT_SHIFT_COLOR_MAP.ORANGE_SHIFT) {
    return NIGHT_SHIFT_COLOR_MAP.ORANGE_SHIFT;
  }
  return ''; // 一般晚班不設定顏色，使用預設的 text-gray-900
}

/**
 * 是否為「今日不出勤」灰字色 —— 班表上探員姓名被改成灰色，代表原本排了班
 * 但當天臨時不出勤（請假、生病、臨時有事等）。班表頁的 AgentChip 透過
 * `--agent-color` 把這個灰直接套到名字色，視覺上自然呈現「失效」；個人頁
 * 需顯式判定以便改變該班 badge 樣式並加上「今日不出勤」標記。
 *
 * 採算法判定：`#RRGGBB` 三段相等（achromatic）即視為灰，排除純黑 `#000000`
 * 與純白 `#ffffff` 以避免邊界誤判。班表中的代班（紅 #ff0000）、換班（藍
 * #1155cc）、綠晚班（#93c47d / #70ad47）、橘晚班（#ff9900）均為彩色，
 * 不會被此函式誤判。
 */
export function isLeaveColor(textColor: string): boolean {
  if (!textColor || textColor.length !== 7 || !textColor.startsWith('#')) {
    return false;
  }
  const r = textColor.slice(1, 3);
  const g = textColor.slice(3, 5);
  const b = textColor.slice(5, 7);
  if (r !== g || g !== b) return false;
  if (r === '00' || r === 'ff') return false;
  return true;
}
