import { describe, expect, it } from 'vitest';
import { summarizeStatistics } from '../../statistics';
import type { AgentStatistics } from '~~/shared/types';

const makeStat = (over: Partial<AgentStatistics>): AgentStatistics => ({
  agentId: 'x',
  name: 'X',
  picture: '',
  dayCount: 0,
  nightCount: 0,
  total: 0,
  ...over,
});

describe('summarizeStatistics', () => {
  it('應加總早班、晚班與總班次', () => {
    const stats = [
      makeStat({ agentId: 'a', dayCount: 10, nightCount: 5, total: 15 }),
      makeStat({ agentId: 'b', dayCount: 8, nightCount: 7, total: 15 }),
      makeStat({ agentId: 'c', dayCount: 5, nightCount: 8, total: 13 }),
    ];

    const summary = summarizeStatistics(stats);

    expect(summary.totalDay).toBe(23);
    expect(summary.totalNight).toBe(20);
    expect(summary.totalShifts).toBe(43);
  });

  it('topAgent 應為陣列第一筆（榜首）', () => {
    const stats = [
      makeStat({ agentId: 'top', total: 30 }),
      makeStat({ agentId: 'second', total: 20 }),
    ];

    expect(summarizeStatistics(stats).topAgent?.agentId).toBe('top');
  });

  it('空陣列時各總計為 0、topAgent 為 null', () => {
    const summary = summarizeStatistics([]);

    expect(summary.totalDay).toBe(0);
    expect(summary.totalNight).toBe(0);
    expect(summary.totalShifts).toBe(0);
    expect(summary.topAgent).toBeNull();
  });
});
