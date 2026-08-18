/**
 * 追蹤載入失敗的圖片來源，讓呼叫端改渲染替代內容。
 *
 * 探員照片全掛在外部 host（見 `shared/constant.ts` 的 `IMAGE_BASE_URL`，其中 77 張
 * 在別家公司的 dev 環境 CDN 上）。那些 host 隨時可能被清掉或關閉，而 `<NuxtImg>`
 * 預設的失敗行為是留下瀏覽器的破圖框：畫面塌掉、alt 文字裸露，dev / CI / log 都
 * 沒有任何訊號。
 *
 * 這裡做兩件事：
 * 1. 記下失敗的 URL，元件據此切到既有的替代呈現（首字、佔位框）
 * 2. 每個 URL 首次失敗時 `console.warn` 一次 —— 上游整個掛掉時，這是唯一會在
 *    瀏覽器 console 留下痕跡的地方
 *
 * 每個元件各自呼叫一次，狀態不跨元件共用：失敗與否是該次渲染的呈現細節，
 * 提升成全域狀態只會多出一份需要清理的快取。
 */
export function useImageFallback() {
  const failedSources = ref<string[]>([]);

  const hasFailed = (src: string) => failedSources.value.includes(src);

  const onImageError = (src: string) => {
    // 已記錄過就不重複告警：切到替代內容後 <img> 會被移除，理論上不會再觸發，
    // 但 carousel 重複渲染同一張時仍可能再進來一次。
    if (hasFailed(src)) return;

    console.warn(`[image] 載入失敗，已改用替代內容：${src}`);
    failedSources.value = [...failedSources.value, src];
  };

  return { hasFailed, onImageError };
}
