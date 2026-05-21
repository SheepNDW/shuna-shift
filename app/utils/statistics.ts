import type { AgentStatistics } from '~~/shared/types';

/** 統計頁摘要四格所需的彙整數據 */
export interface StatisticsSummary {
  /** 早班總次數 */
  totalDay: number;
  /** 晚班總次數 */
  totalNight: number;
  /** 早 + 晚班次總合 */
  totalShifts: number;
  /** 榜首探員（MVP）；無資料時為 null */
  topAgent: AgentStatistics | null;
}

/**
 * 由探員統計陣列彙整統計頁摘要四格數據。
 *
 * statistics 須為 server 端 calculateAgentStatistics 已排序的結果，
 * topAgent 直接取榜首（其排序含決定性 tie-breaker，平手不致無聲偏袒）。
 */
export function summarizeStatistics(statistics: AgentStatistics[]): StatisticsSummary {
  const totalDay = statistics.reduce((sum, stat) => sum + stat.dayCount, 0);
  const totalNight = statistics.reduce((sum, stat) => sum + stat.nightCount, 0);

  return {
    totalDay,
    totalNight,
    totalShifts: totalDay + totalNight,
    topAgent: statistics[0] ?? null,
  };
}
