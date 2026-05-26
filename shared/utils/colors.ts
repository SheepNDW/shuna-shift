// 跨 runtime（server / client）共用的色彩判定工具。
//
// 之所以放在 shared/ 而非 app/utils/，是因為 server 端的 `calculateAgentStatistics`
// 也需要排除「灰字＝今日不出勤」的班次，避免個人頁 badge「今日不出勤」與
// 統計頁的「近 3 個月」班次數自相矛盾（一邊算進去、一邊顯示不出勤）。
//
// 若日後其他色碼判定也需要跨 runtime 共用，集中放在此檔即可。

/**
 * 是否為「今日不出勤」灰字色 —— 班表上探員姓名被改成灰色，代表原本排了班
 * 但當天臨時不出勤（請假、生病、臨時有事等）。
 *
 * 採算法判定：`#RRGGBB` 三段相等（achromatic）即視為灰，排除純黑 `#000000`
 * 與純白 `#ffffff` 以避免邊界誤判。班表中的代班（紅 #ff0000）、換班（藍
 * #1155cc）、綠晚班（#93c47d / #70ad47）、橘晚班（#ff9900）均為彩色，
 * 不會被此函式誤判。
 *
 * 大小寫無關：輸入會先 lowercase 再比對，避免外部呼叫者傳入 `#FFFFFF` 之類
 * 大寫格式時三段相等但 `'FF' !== 'ff'` 而誤判為灰。
 */
export function isLeaveColor(textColor: string): boolean {
  if (!textColor || textColor.length !== 7 || !textColor.startsWith('#')) {
    return false;
  }
  const hex = textColor.toLowerCase();
  const r = hex.slice(1, 3);
  const g = hex.slice(3, 5);
  const b = hex.slice(5, 7);
  if (r !== g || g !== b) return false;
  if (r === '00' || r === 'ff') return false;
  return true;
}
