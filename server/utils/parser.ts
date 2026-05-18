import { normalizeAgentName } from '~~/shared/constant';
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

/** 班別：早班／晚班；`''` 代表 B 欄空白或無法判定 */
export type ShiftType = 'day' | 'night' | '';

/**
 * 解析班表 B 欄的班別文字。
 *
 * 刻意採窄比對：僅接受單字「早」/「晚」（前後空白會去除）。其他寫法
 * （如「早班」、`AM`/`PM`）一律回傳 `''`，由呼叫端 `mergeDayAndNightShifts`
 * 退回位置推斷。若表單日後改用其他用字，須一併調整此處。
 * @param value B 欄儲存格的字串值
 * @returns `'day'`（早）／`'night'`（晚）／`''`（空白或無法判定）
 */
export function parseShiftType(value: string | undefined): ShiftType {
  switch (value?.trim()) {
    case '早':
      return 'day';
    case '晚':
      return 'night';
    default:
      return '';
  }
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
  let currentIndex = 0;

  for (let i = 0; i < names.length; i++) {
    const agentName = names[i]!;

    // 只檢查名字開始位置的格式
    let textColor = '';

    if (formatMap.has(currentIndex)) {
      const run = formatMap.get(currentIndex);
      if (run?.format?.foregroundColor && Object.keys(run.format.foregroundColor).length > 0) {
        textColor = rgbToHex(run.format.foregroundColor);
      }
    }

    result.push({ name: normalizeAgentName(agentName), textColor });

    // 更新索引：名字長度 + 頓號（1個字符）
    currentIndex += agentName.length + 1;
  }

  return result;
}
