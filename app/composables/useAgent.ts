import { AGENTS } from '~~/shared/constant';
import type { ShiftSchedule } from '~~/shared/types';
import { parseAgentCell } from '~~/shared/utils/agent-name';

// 篩選該探員的排班資料
export interface AgentScheduleItem {
  /** 原封不動沿用班表的日期欄位（含作為事實來源的 `iso`） */
  date: ShiftSchedule['date'];
  dayShifts: { name: string; textColor: string }[];
  nightShifts: { name: string; textColor: string }[];
}

export async function useAgent(agentId: string) {
  // hasError 一併代理出去：探員頁只看 agentSchedules 長度的話，班表抓失敗會與
  // 「這位探員這段期間真的沒班」渲染成同一個空狀態。
  const { schedules, hasError } = await useSchedules();

  const agentInfo = computed(() => {
    const agent = Array.from(AGENTS.values()).find((a) => a.id === agentId);

    if (!agent) return null;

    return agent;
  });

  const agentSchedules = computed<AgentScheduleItem[]>(() => {
    if (!agentInfo.value) return [];

    const isThisAgent = (agent: { name: string }): boolean =>
      AGENTS.get(parseAgentCell(agent.name).name)?.id === agentId;

    return schedules.value
      .map((schedule) => {
        const dayShifts = schedule.day.filter(isThisAgent);
        const nightShifts = schedule.night.filter(isThisAgent);

        if (dayShifts.length > 0 || nightShifts.length > 0) {
          return {
            date: schedule.date,
            dayShifts,
            nightShifts,
          };
        }
        return null;
      })
      .filter((item) => item !== null);
  });

  return {
    agentInfo,
    agentSchedules,
    hasError,
  };
}
