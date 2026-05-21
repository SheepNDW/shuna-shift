// 班表日期格背景色 → 特殊日分類。色碼取自 Google Sheets 日期格的實際背景色，
// 由 server/utils/transformer 用來把分類補進 description，讓特殊日以文字呈現
// （而非僅靠顏色）；前端元件亦用來判定店休日。

/** 各特殊日類別對應的日期格背景色（表單實際色碼）。 */
export const DATE_BACKGROUND = {
  /** 店休 */
  CLOSED: '#999999',
  /** 活動週 */
  EVENT_WEEK: '#9cc2e5',
  /** 一日限定 */
  SPECIAL_DAY: '#b6d7a8',
  /** 生誕祭 / 生誕出勤 */
  BIRTHDAY: '#d5a6bd',
} as const;

export type SpecialDateKind = 'closed' | 'event-week' | 'special-day' | 'birthday';

const KIND_BY_BACKGROUND = new Map<string, SpecialDateKind>([
  [DATE_BACKGROUND.CLOSED, 'closed'],
  [DATE_BACKGROUND.EVENT_WEEK, 'event-week'],
  [DATE_BACKGROUND.SPECIAL_DAY, 'special-day'],
  [DATE_BACKGROUND.BIRTHDAY, 'birthday'],
]);

const LABEL_BY_KIND: Record<SpecialDateKind, string> = {
  closed: '店休',
  'event-week': '活動週',
  'special-day': '一日限定',
  birthday: '生誕祭',
};

/** 由日期格背景色判斷特殊日類別；非特殊日（含空字串）回傳 null。 */
export function getSpecialDateKind(backgroundColor: string): SpecialDateKind | null {
  if (!backgroundColor) return null;
  return KIND_BY_BACKGROUND.get(backgroundColor.toLowerCase()) ?? null;
}

/** 取特殊日類別的中文標籤。 */
export function getSpecialDateLabel(kind: SpecialDateKind): string {
  return LABEL_BY_KIND[kind];
}

/** 是否為店休日。 */
export function isClosedDate(backgroundColor: string): boolean {
  return getSpecialDateKind(backgroundColor) === 'closed';
}
