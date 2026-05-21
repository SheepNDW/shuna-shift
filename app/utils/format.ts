/**
 * 將數字補零為至少兩位數的字串（例：3 → "03"、12 → "12"）。
 * 超過兩位數時維持原樣，不截斷。
 */
export function padZero(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * 將日期範圍格式化為「{from} – {to}」字串。
 * 任一端為空字串或未提供時回傳 undefined（供 PageHeader meta 等選填欄位使用）。
 */
export function formatDateRange(
  range: { from: string; to: string } | undefined,
): string | undefined {
  if (!range?.from || !range?.to) return undefined;
  return `${range.from} – ${range.to}`;
}
