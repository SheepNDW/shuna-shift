import { AGENTS } from '~~/shared/constant';
import type { ShiftSchedule } from '~~/shared/types';

// 篩選該探員的排班資料
export interface AgentScheduleItem {
  /** 原封不動沿用班表的日期欄位（含作為事實來源的 `iso`） */
  date: ShiftSchedule['date'];
  dayShifts: { name: string; textColor: string }[];
  nightShifts: { name: string; textColor: string }[];
}

export function useAgent(agentId: string) {
  const scheduleStore = useScheduleStore();

  const agentInfo = computed(() => {
    const agent = Array.from(AGENTS.values()).find((a) => a.id === agentId);

    if (!agent) return null;

    return agent;
  });

  const agentSchedules = computed<AgentScheduleItem[]>(() => {
    if (!agentInfo.value) return [];

    return scheduleStore.schedules
      .map((schedule) => {
        const dayShifts = schedule.day.filter((agent) => {
          const name = agent.name.split('(')[0]?.trim() || agent.name;
          return AGENTS.get(name)?.id === agentId;
        });

        const nightShifts = schedule.night.filter((agent) => {
          const name = agent.name.split('(')[0]?.trim() || agent.name;
          return AGENTS.get(name)?.id === agentId;
        });

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
  };
}
