// 班表探員儲存格的唯一解析入口 —— 前端（chip / 頭像 / 個人頁 / 篩選）與後端
// （統計）共用同一份剝括號規則，避免同一格資料在不同畫面被解讀成不同的人。
//
// 括號在班表裡承載兩種完全不同的語意，靠位置無法區分，只能看括號內容：
//   和実(亞米)    → 和実代亞米的班，當班者是「和実」
//   亞米(~18:00)  → 亞米當班但提早離開，當班者是「亞米」
// 兩者都要剝掉括號才查得到人，但只有前者能說出「原班探員是誰」。
//
// 全形括號（`（）`）目前的班表資料中尚未出現，但表單是人工填寫的中文輸入法，
// 遲早會混進來；規則一律兩種括號並收。

import { AGENTS, normalizeAgentName } from '../constant';

/**
 * 括號內容的語意。
 *
 * `unknown` 保留原字串而不硬歸類：括號是人工填寫的自由欄位，猜錯的代價是
 * UI 指認一個不存在的原班探員。呼叫端可據此原樣顯示，但不得當成探員名稱使用。
 */
export type AgentCellNote =
  | { kind: 'original-agent'; agent: string }
  | { kind: 'time'; text: string }
  | { kind: 'unknown'; text: string };

export interface ParsedAgentCell {
  /** 當班探員名稱，已剝括號並正規化為 `AGENTS` 的鍵值 */
  name: string;
  /** 括號內容的語意；無括號（或括號內為空）時為 null */
  note: AgentCellNote | null;
}

/** 半形與全形的括號 */
const OPEN_BRACKETS = ['(', '（'] as const;
const CLOSE_BRACKETS = [')', '）'] as const;

/**
 * 時間註記的形狀：波浪號，或 `18:00` 這種時分。
 *
 * 不能只看「有沒有數字」—— `亞米(2樓)`、`小楓(代1)` 會被歸成時間，型別上宣告的
 * `time` 就名不符實，日後有人依 `kind === 'time'` 做時段顯示會直接踩到。
 */
const TIME_HINT = /[~～]|\d{1,2}\s*[:：]\s*\d{2}/;

/** 取最先出現的任一字元位置；都沒出現時回傳 -1 */
function indexOfAny(text: string, chars: readonly string[]): number {
  const positions = chars.map((char) => text.indexOf(char)).filter((index) => index !== -1);
  return positions.length > 0 ? Math.min(...positions) : -1;
}

/** 判定括號內容的語意；括號內為空時視為沒有註記 */
function classifyNote(inner: string): AgentCellNote | null {
  if (!inner) return null;

  const normalized = normalizeAgentName(inner);
  if (AGENTS.has(normalized)) {
    return { kind: 'original-agent', agent: normalized };
  }

  if (TIME_HINT.test(inner)) {
    return { kind: 'time', text: inner };
  }

  return { kind: 'unknown', text: inner };
}

/**
 * 解析班表的單一探員儲存格。
 *
 * @param raw - 班表原始字串，例如 `泠泠`、`和実(亞米)`、`亞米(~18:00)`
 */
export function parseAgentCell(raw: string): ParsedAgentCell {
  const trimmed = raw.trim();
  const openIndex = indexOfAny(trimmed, OPEN_BRACKETS);

  if (openIndex === -1) {
    return { name: normalizeAgentName(trimmed), note: null };
  }

  const prefix = trimmed.slice(0, openIndex).trim();
  // 括號前沒有名字（`(泠泠)`）時無從得知當班者是誰，整格原樣留著，
  // 由呼叫端當成查不到的探員處理，而不是把括號內的人誤當成當班者。
  if (!prefix) {
    return { name: trimmed, note: null };
  }

  // 只取第一組括號的內容。右括號後面還跟著字（`亞米(~18:00)備註`）或第二組括號
  // （`小楓(泠泠)(換)`）都是手填變體，多餘的部分混進來會讓內容判定不出語意。
  // 括號未閉合時整段當註記，`亞米(~18:00` 這種漏字仍讀得出來。
  const afterOpen = trimmed.slice(openIndex + 1);
  const closeIndex = indexOfAny(afterOpen, CLOSE_BRACKETS);
  const inner = (closeIndex === -1 ? afterOpen : afterOpen.slice(0, closeIndex)).trim();

  return { name: normalizeAgentName(prefix), note: classifyNote(inner) };
}

/**
 * 儲存格是否屬於篩選選中的探員。
 *
 * 篩選集合存的是 `AGENTS` 的鍵值，班表資料卻可能帶括號或別名，
 * 直接比對原字串會漏掉整批代班 / 時間註記的班次。
 *
 * @param raw - 班表原始字串
 * @param selected - 選中的探員名稱集合（`AGENTS` 鍵值）
 */
export function isSelectedAgentCell(raw: string, selected: ReadonlySet<string>): boolean {
  return selected.has(parseAgentCell(raw).name);
}
