import { AGENTS, normalizeAgentName } from '~~/shared/constant';
import type { AgentStatistics, ShiftSchedule } from '~~/shared/types';

/**
 * 從探員名稱中提取實際執行值班的探員名稱
 * 處理括號內原探員名稱的情況，例如 "小楓(泠泠)" 回傳 "小楓"
 */
export function extractAgentName(name: string): string {
  const match = name.match(/^(.+?)\s*[(（]/);
  return match ? match[1]!.trim() : name.trim();
}

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
 * 解析班表日期字串（例如 "12月16日"）為 Date 物件
 * @param dateStr - 日期字串
 * @param referenceDate - 參考日期，用於判斷年份
 */
export function parseDateString(dateStr: string, referenceDate: Date = new Date()): Date | null {
  const match = dateStr.match(/(\d+)月(\d+)日/);
  if (!match) return null;

  const month = parseInt(match[1]!, 10) - 1;
  const day = parseInt(match[2]!, 10);

  // 判斷年份：如果月份大於參考日期的月份，可能是去年的資料
  let year = referenceDate.getFullYear();
  if (month > referenceDate.getMonth()) {
    year -= 1;
  }

  return new Date(year, month, day);
}

/**
 * 從班表資料中找出最後一筆的日期
 * @param schedules - 班表資料陣列
 */
export function getLastScheduleDate(schedules: ShiftSchedule[]): Date | null {
  if (schedules.length === 0) return null;

  const lastSchedule = schedules[schedules.length - 1]!;
  return parseDateString(lastSchedule.date.datetime);
}

/**
 * 截取近 N 個月的班表資料
 * @param schedules - 完整班表資料（按日期排序）
 * @param months - 月份數量
 * @param referenceDate - 參考日期（預設為資料最後一筆的日期）
 * @returns 截取後的班表資料
 */
export function filterRecentMonths(
  schedules: ShiftSchedule[],
  months: number,
  referenceDate?: Date,
): ShiftSchedule[] {
  if (schedules.length === 0) return [];

  // 如果沒有指定參考日期，使用資料最後一筆的日期
  const endDate = referenceDate ?? getLastScheduleDate(schedules) ?? new Date();

  // 計算 N 個月前的日期
  const cutoffDate = new Date(endDate);
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  return schedules.filter((schedule) => {
    const scheduleDate = parseDateString(schedule.date.datetime, endDate);
    if (!scheduleDate) return false;
    // 過濾在區間內的資料：cutoffDate <= scheduleDate <= endDate
    return scheduleDate >= cutoffDate && scheduleDate <= endDate;
  });
}

/**
 * 從班表資料計算各探員的值班統計
 * @param schedules - 班表資料陣列
 * @returns 按總班次降序排列的統計陣列
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
      const agentName = extractAgentName(agent.name);
      const agentData = findAgentByName(agentName);

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
      const agentName = extractAgentName(agent.name);
      const agentData = findAgentByName(agentName);

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

  // 按總班次降序排列
  return statistics.sort((a, b) => b.total - a.total);
}

/**
 * 取得日期範圍描述（基於實際班表資料）
 * @param schedules - 班表資料陣列
 * @returns 實際資料的起始和結束日期
 */
export function getDateRange(schedules: ShiftSchedule[]): { from: string; to: string } {
  if (schedules.length === 0) {
    return { from: '', to: '' };
  }

  const formatDate = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  // 取得第一筆資料的日期
  const firstSchedule = schedules[0]!;
  const firstDate = parseDateString(firstSchedule.date.datetime);

  // 取得最後一筆資料的日期
  const lastSchedule = schedules[schedules.length - 1]!;
  const lastDate = parseDateString(lastSchedule.date.datetime);

  if (!firstDate || !lastDate) {
    return { from: '', to: '' };
  }

  return {
    from: formatDate(firstDate),
    to: formatDate(lastDate),
  };
}
