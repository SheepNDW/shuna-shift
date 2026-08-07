import { defineStore } from 'pinia';

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref<ShiftSchedule[]>([]);
  const lastUpdated = ref<string>('');
  /**
   * 班表載入失敗。
   *
   * 頁面要靠它區分「今天真的沒排班」與「資料根本沒拿到」。兩者若都渲染成同一個
   * 空狀態，Sheets API 掛掉時畫面會出現一個很有自信的「今日無排班」；而首頁與
   * /shifts 現在已改回 SSR，這份錯誤內容會直接烘進首屏 HTML 被爬蟲收走。
   */
  const hasError = ref(false);

  const todaySchedule = computed(() => {
    const todayLabel = getTodayLabel();
    const today = schedules.value.find((schedule) => schedule.date.datetime === todayLabel);

    if (!today) {
      return null;
    }
    return today;
  });

  const { data, error, execute, status } = useFetch<ScheduleResponse>('/api/sheet', {
    immediate: false,
    default: () => ({ schedules: [], metadata: { lastUpdated: '' } }),
  });

  async function fetchSchedules({ refresh = false }: { refresh?: boolean } = {}) {
    if (status.value !== 'idle' && !refresh) return;

    await execute();

    if (error.value) {
      hasError.value = true;
      // 刻意不用 default 的空資料覆蓋既有班表：重新整理失敗時，
      // 舊班表仍比空畫面有用，錯誤本身由 hasError 呈現。
      return;
    }

    hasError.value = false;
    schedules.value = data.value.schedules;
    lastUpdated.value = data.value.metadata.lastUpdated;
  }

  return {
    schedules,
    lastUpdated,
    hasError,
    todaySchedule,
    fetchSchedules,
  };
});
