import { defineStore } from 'pinia';

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref<ShiftSchedule[]>([]);

  const todaySchedule = computed(() => {
    // 取得今日 zh-TW 日期 (MM月dd日)
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const todayLabel = `${month}月${day}日`;

    return schedules.value.find((schedule) => schedule.date.datetime === todayLabel);
  });

  const { data, execute, status } = useFetch<ShiftSchedule[]>('/api/sheet', {
    immediate: false,
    default: () => [],
  });

  async function fetchSchedules({ refresh = false }: { refresh?: boolean } = {}) {
    if (status.value !== 'idle' && !refresh) return;

    await execute();
    schedules.value = data.value;
  }

  return {
    schedules,
    todaySchedule,
    fetchSchedules,
  };
});
