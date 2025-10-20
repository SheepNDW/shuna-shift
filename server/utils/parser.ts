import type { TextFormatRun } from '~~/shared/types';

export function excelSerialToDateLabel(serial: number): string {
  const base = Date.UTC(1899, 11, 30);
  const millis = Math.floor(serial) * 86400000;
  const utcDate = new Date(base + millis);

  const month = utcDate.getUTCMonth() + 1;
  const day = utcDate.getUTCDate();

  return `${month}月${day}日`;
}

export function rgbToHex(color: { red?: number; green?: number; blue?: number }): string {
  const r = Math.round((color.red ?? 0) * 255);
  const g = Math.round((color.green ?? 0) * 255);
  const b = Math.round((color.blue ?? 0) * 255);

  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export function parseAgents(name: string, runs: TextFormatRun[] = []) {
  const names = name.split('、').filter((n) => n.trim());

  const formatMap = new Map<number, TextFormatRun>();
  runs.forEach((run) => {
    if (run.startIndex !== undefined) {
      formatMap.set(run.startIndex, run);
    }
  });

  const result: { name: string; textColor: string }[] = [];
  let currentIndex = 1; // 1-based index

  for (let i = 0; i < names.length; i++) {
    const agentName = names[i]!;

    // 檢查當前名字開始位置是否有格式定義
    let textColor = '';

    // 遍歷當前名字的每個字符，找到適用的格式
    for (let charIdx = 0; charIdx < agentName.length; charIdx++) {
      const pos = currentIndex + charIdx;
      if (formatMap.has(pos)) {
        const run = formatMap.get(pos);
        if (run?.format?.foregroundColor && Object.keys(run.format.foregroundColor).length > 0) {
          textColor = rgbToHex(run.format.foregroundColor);
        } else {
          textColor = '';
        }
      }
    }

    result.push({ name: agentName, textColor });

    // 更新索引：名字長度 + 頓號（1個字符）
    currentIndex += agentName.length + 1;
  }

  return result;
}
