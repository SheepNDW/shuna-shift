/**
 * 分享卡片用的靜態圖，放在 `public/`。
 *
 * 刻意不用探員照片：那些圖掛在外部 host（見 `shared/constant.ts` 的 `IMAGE_BASE_URL`），
 * host 一旦不可用，連分享卡片都會跟著空掉。
 */
const OG_IMAGE_PATH = '/og-image.png';
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

interface SeoOptions {
  /** 頁面標題，不含站名 —— 站名由此處統一補上，各頁不必自己組 */
  title: string;
  /** 搜尋結果與分享卡片的摘要，各頁都要給：缺了就沒有 og:description */
  description: string;
}

/**
 * 每一頁的 metadata 單一入口：`<title>` / description / Open Graph / Twitter Card /
 * canonical 一次設完。
 *
 * 之所以不讓各頁自己寫 `useHead`：og 標籤有十來個、彼此又必須一致（`og:title` 與
 * `<title>` 不同步、`twitter:image` 漏一個，症狀都是「分享出去沒有預覽卡」而已，
 * 在瀏覽器裡完全看不出來）。集中成一支，新頁面只要給 title / description。
 *
 * 站台網址走 `runtimeConfig.public.siteUrl`（可用 `NUXT_PUBLIC_SITE_URL` 覆蓋），
 * 因為 og:url 與 canonical 必須是絕對網址，相對路徑會被 LINE / Facebook 直接忽略。
 *
 * 參數收純值而非 ref / getter 是可以的：`<NuxtPage>` 的預設 key 走
 * `generateRouteKey` → `interpolatePath`，會把 `:id` 換成實際的 `route.params.id`
 * （見 `nuxt/dist/pages/runtime/utils.js`），所以 `/agents/rin` 與 `/agents/luna`
 * 的 key 不同、元件會重建、`setup()` 重跑。實測 client-side 導覽這兩頁，`<title>`、
 * `og:title` 與 canonical 都正確更新。日後若有人給 `/agents/[id]` 加上
 * `definePageMeta({ key: ... })` 把 key 固定住，這個前提才會失效。
 */
export function useSeo({ title, description }: SeoOptions) {
  const appConfig = useAppConfig();
  const route = useRoute();
  const { siteUrl } = useRuntimeConfig().public;

  const fullTitle = `${appConfig.title} - ${title}`;

  // 一律取 `route.path` 而非 `fullPath`：目前唯一會出現的 query 是 `/shifts?date=`
  // （由探員頁的「當日全體」連結產生），它只影響捲動位置，內容是同一份。帶進
  // canonical 會讓同一頁被當成好幾個 URL，分享出去的卡片也會因為 query 不同而
  // 各自被快取一次。
  const url = new URL(route.path, siteUrl).href;
  const image = new URL(OG_IMAGE_PATH, siteUrl).href;

  useSeoMeta({
    title: fullTitle,
    description,

    ogTitle: fullTitle,
    ogDescription: description,
    ogUrl: url,
    ogType: 'website',
    ogSiteName: appConfig.title,
    ogLocale: 'zh_TW',
    ogImage: image,
    // 寬高要顯式給：抓不到尺寸時 LINE / Facebook 會退成小圖或延後渲染
    ogImageWidth: OG_IMAGE_WIDTH,
    ogImageHeight: OG_IMAGE_HEIGHT,
    ogImageAlt: appConfig.title,

    twitterCard: 'summary_large_image',
    twitterTitle: fullTitle,
    twitterDescription: description,
    twitterImage: image,
    twitterImageAlt: appConfig.title,
  });

  useHead({
    link: [{ rel: 'canonical', href: url }],
  });
}
