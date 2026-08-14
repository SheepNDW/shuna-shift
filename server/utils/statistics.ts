import { AGENTS, normalizeAgentName } from '~~/shared/constant';
import type { AgentStatistics, ShiftSchedule } from '~~/shared/types';
import { parseAgentCell } from '~~/shared/utils/agent-name';
import { isLeaveColor } from '~~/shared/utils/colors';
import { addMonthsToIso, getTodayIso, isoToDateLabel } from '~~/shared/utils/date';

/**
 * 從 AGENTS 常數中找到對應的 Agent 資料。
 *
 * 先以 `normalizeAgentName` 將輸入（可能為 emoji、大小寫變體或名稱別名）
 * 正規化為正式名稱，再以正式名稱查表。
 */
export function findAgentByName(name: string): {
  id: string;
  name: string;
  picture: string;
  isFullTime?: boolean;
} | null {
  const agent = AGENTS.get(normalizeAgentName(name));
  if (!agent) {
    return null;
  }

  return {
    id: agent.id,
    name: agent.name,
    picture: agent.picture,
    isFullTime: agent.isFullTime,
  };
}

/**
 * 從班表資料中找出最後一筆的 ISO 日期
 * @param schedules - 班表資料陣列（按日期排序）
 * @returns ISO 日期；空陣列或該筆無日期時回傳 null
 */
export function getLastScheduleIso(schedules: ShiftSchedule[]): string | null {
  const lastSchedule = schedules[schedules.length - 1];
  return lastSchedule?.date.iso || null;
}

/**
 * 決定統計視窗的右端 —— `min(今天, 資料最後一筆)`。
 *
 * 不能直接拿「資料最後一筆」當基準：當期班表會預先排到月底以後，最後一筆必然
 * 落在未來，於是尚未發生的班次會被算成出勤 —— 排得越前面，「近三個月」裡的未來
 * 占比越高，MVP 也會因為「誰被排得比較前面」而失真。
 * 「出勤」在中文語境是既成事實，故一律收斂到今天為止。
 *
 * 反向的情況（資料還沒排到今天，例如換期空窗）則以最後一筆為準，免得視窗右端
 * 落在一段完全沒有資料的區間上。
 *
 * 與 `/api/statistics` 的 6 小時快取有一層交互：`endIso` 只在填快取那一刻算一次，
 * 因此台北 23:55 填的快取，到隔天 05:55 前右端仍會停在前一天。觸發窗口是台北
 * 00:00–06:00 —— 那段時間「今天」的班本來就還沒發生，統計數字不受影響，唯一
 * 可見症狀是 `dateRange.to` 標籤慢一天；整包 payload 依設計本來就最多陳舊 6 小時，
 * 故不為此在快取層另加日期維度。
 *
 * @param schedules - 班表資料陣列（按日期排序）
 * @param todayIso - 台北的今天；由呼叫端傳入以免同一次判斷讀到兩個不同的「現在」
 */
export function resolveStatisticsEndIso(
  schedules: ShiftSchedule[],
  todayIso: string = getTodayIso(),
): string {
  const lastIso = getLastScheduleIso(schedules);
  if (!lastIso) return todayIso;

  return lastIso < todayIso ? lastIso : todayIso;
}

/**
 * 截取近 N 個月的班表資料。
 *
 * ISO 日期為固定長度、零填補，字串比較即等於日期比較，不需要轉 Date 也不需要
 * 推算年份。無日期的列（`iso` 為空字串）一律落在區間外而被濾掉。
 *
 * @param schedules - 完整班表資料（按日期排序）
 * @param months - 月份數量
 * @param referenceIso - 視窗右端的 ISO 日期（預設為資料最後一筆）
 * @returns 截取後的班表資料
 */
export function filterRecentMonths(
  schedules: ShiftSchedule[],
  months: number,
  referenceIso?: string,
): ShiftSchedule[] {
  if (schedules.length === 0) return [];

  const endIso = referenceIso ?? getLastScheduleIso(schedules) ?? getTodayIso();
  const cutoffIso = addMonthsToIso(endIso, -months);
  // endIso 不是合法 ISO（例如呼叫端傳了顯示標籤）時寧可回傳空陣列，
  // 也不要讓一個算不出來的界線靜默放行全部資料。
  // 目前的呼叫端都給得出合法 ISO，真的走到這裡代表接線壞了 ——
  // 症狀會是「全零的統計頁」，沒有 log 的話極難回推到這一行。
  if (!cutoffIso) {
    console.warn(`[statistics] 無法由 "${endIso}" 算出視窗左端，本次過濾回傳空陣列`);
    return [];
  }

  return schedules.filter(({ date }) => date.iso >= cutoffIso && date.iso <= endIso);
}

/**
 * 從班表資料計算各探員的值班統計
 * @param schedules - 班表資料陣列
 * @returns 統計陣列（依總班次降序；平手時以日班數、名稱決定先後）
 */
export function calculateAgentStatistics(schedules: ShiftSchedule[]): AgentStatistics[] {
  // 使用 Map 來累計各探員的班次
  const statsMap = new Map<
    string,
    {
      dayCount: number;
      nightCount: number;
      agentData: { id: string; name: string; picture: string; isFullTime?: boolean };
    }
  >();

  // 遍歷所有班表
  for (const schedule of schedules) {
    // 統計日班
    for (const agent of schedule.day) {
      // 灰字 textColor 代表「今日不出勤」(臨時請假),不算實際出勤班次
      if (isLeaveColor(agent.textColor)) continue;

      const agentData = findAgentByName(parseAgentCell(agent.name).name);

      if (agentData) {
        const existing = statsMap.get(agentData.id);
        if (existing) {
          existing.dayCount += 1;
        } else {
          statsMap.set(agentData.id, {
            dayCount: 1,
            nightCount: 0,
            agentData,
          });
        }
      }
    }

    // 統計晚班
    for (const agent of schedule.night) {
      if (isLeaveColor(agent.textColor)) continue;

      const agentData = findAgentByName(parseAgentCell(agent.name).name);

      if (agentData) {
        const existing = statsMap.get(agentData.id);
        if (existing) {
          existing.nightCount += 1;
        } else {
          statsMap.set(agentData.id, {
            dayCount: 0,
            nightCount: 1,
            agentData,
          });
        }
      }
    }
  }

  // 轉換為陣列並計算總數
  const statistics: AgentStatistics[] = Array.from(statsMap.values()).map(
    ({ dayCount, nightCount, agentData }) => ({
      agentId: agentData.id,
      name: agentData.name,
      picture: agentData.picture,
      dayCount,
      nightCount,
      total: dayCount + nightCount,
      isFullTime: agentData.isFullTime,
    }),
  );

  // 依總班次降序排列；平手時以日班數降序、再以名稱升序作為決定性 tie-breaker，
  // 避免排名與 MVP 因 Map 插入序而產生不穩定／不公平的先後。
  return statistics.sort(
    (a, b) =>
      b.total - a.total ||
      b.dayCount - a.dayCount ||
      a.name.localeCompare(b.name),
  );
}

/**
 * 取得日期範圍描述（基於實際班表資料）。
 *
 * 回傳的是顯示用標籤 —— 這組值只餵給統計頁 PageHeader 的 meta，不參與任何比較。
 *
 * @param schedules - 班表資料陣列（按日期排序）
 * @returns 實際資料的起始和結束日期標籤；任一端缺日期時兩端皆回空字串
 */
export function getDateRange(schedules: ShiftSchedule[]): { from: string; to: string } {
  const firstSchedule = schedules[0];
  const lastSchedule = schedules[schedules.length - 1];

  if (!firstSchedule || !lastSchedule) {
    return { from: '', to: '' };
  }

  const from = isoToDateLabel(firstSchedule.date.iso);
  const to = isoToDateLabel(lastSchedule.date.iso);

  // 只有一端算得出來的話，「– 到某日」讀起來比沒有更誤導
  if (!from || !to) {
    return { from: '', to: '' };
  }

  return { from, to };
}
