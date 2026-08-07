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
      // 不用 default 的空資料覆蓋既有班表。
      //
      // 這條路目前實際走不到：唯一的呼叫端是 app.vue 的 callOnce（首次載入，
      // 此時本來就沒有舊資料可留），`refresh: true` 還沒有任何呼叫端。留著是為了
      // 日後真的加上重新整理時，失敗不會把已經看得到的班表清空。
      //
      // 另注意兩頁現在是「有錯誤就只渲染錯誤狀態」；屆時若要顯示留下來的舊資料，
      // 頁面那邊要一併調整（例如改以 schedules 是否為空分辨首載失敗與重整失敗）。
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
