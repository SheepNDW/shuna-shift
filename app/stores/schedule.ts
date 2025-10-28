import { defineStore } from 'pinia';

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref<ShiftSchedule[]>([]);
  const lastUpdated = ref<string>('');

  const todaySchedule = computed(() => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const todayLabel = `${month}月${day}日`;

    return schedules.value.find((schedule) => schedule.date.datetime === todayLabel);
  });

  const { data, execute, status } = useFetch<ScheduleResponse>('/api/sheet', {
    immediate: false,
    default: () => ({ schedules: [], metadata: { lastUpdated: '' } }),
  });

  async function fetchSchedules({ refresh = false }: { refresh?: boolean } = {}) {
    if (status.value !== 'idle' && !refresh) return;

    await execute();
    schedules.value = data.value.schedules;
    lastUpdated.value = data.value.metadata.lastUpdated;
  }

  return {
    schedules,
    lastUpdated,
    todaySchedule,
    fetchSchedules,
  };
});
