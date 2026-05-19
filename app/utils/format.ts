/**
 * 將數字補零為至少兩位數的字串（例：3 → "03"、12 → "12"）。
 * 超過兩位數時維持原樣，不截斷。
 */
export function padZero(value: number): string {
  return String(value).padStart(2, '0');
}
