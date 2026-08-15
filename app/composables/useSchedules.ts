import type { ScheduleResponse } from '~~/shared/types';

/**
 * 班表的 asyncData key，全站共用一份。
 *
 * 寫死而非讓 `useFetch` 自動生成：自動 key 由呼叫點推導，footer、首頁、/shifts、
 * 探員頁會各自拿到一份獨立快取，同一支 API 被重複請求。指定同一個 key 後，
 * 第二個以後的呼叫端直接接上既有的 asyncData，不會再發請求。
 */
const SCHEDULES_KEY = 'schedules';

/**
 * 全站班表資料。
 *
 * 這裡沒有 store：班表是純粹的 server state，複製一份到 client store 只會多出
 * 一個需要手動同步的事實來源。呼叫端一律 `await`，SSR 才拿得到內容
 * （首頁與 /shifts 的首屏是要給爬蟲收的）。
 */
export async function useSchedules() {
  const { data, error } = await useFetch<ScheduleResponse>('/api/sheet', {
    key: SCHEDULES_KEY,
    default: () => ({ schedules: [], metadata: { lastUpdated: '' } }),
    // 共用 key 只保證大家指向同一份 asyncData，擋不住重複請求；真正讓「全站只打
    // 一次」成立的是這個 getCachedData（理由見 reusePayloadData 的註解）。
    getCachedData: reusePayloadData<ScheduleResponse>,
    // 萬一兩個呼叫端同時進來，後者接上前者那個 in-flight 請求；預設的 'cancel'
    // 會反過來中止前者再重打一次。
    dedupe: 'defer',
  });

  const schedules = computed(() => data.value.schedules);
  const lastUpdated = computed(() => data.value.metadata.lastUpdated);

  /**
   * 班表載入失敗。
   *
   * 頁面要靠它區分「今天真的沒排班」與「資料根本沒拿到」。兩者若都渲染成同一個
   * 空狀態，Sheets API 掛掉時畫面會出現一個很有自信的「今日無排班」，而這份錯誤
   * 內容會直接烘進首屏 HTML 被爬蟲收走。
   *
   * 注意 `useFetch` 失敗時會把 `data` 退回上面的空 default，因此重新整理失敗會清空
   * 已顯示的班表。目前沒有任何重新整理的呼叫端（唯一入口是首次載入），所以走不到；
   * 日後若要加，得在這裡保留前一次成功的資料，頁面也要一併改成能同時呈現舊資料與
   * 錯誤提示。
   */
  const hasError = computed(() => Boolean(error.value));

  // 以 ISO 日期比對而非「X月Y日」標籤：標籤不帶年份，歷史班表累積超過 12 個月時
  // 同一個標籤會對應兩天，命中的可能是去年的同一天。
  const todaySchedule = computed(() => {
    const todayIso = getTodayIso();
    return schedules.value.find((schedule) => schedule.date.iso === todayIso) ?? null;
  });

  return {
    schedules,
    lastUpdated,
    hasError,
    todaySchedule,
  };
}
