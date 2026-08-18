// https://nuxt.com/docs/api/configuration/nuxt-config
import { IMAGE_HOSTS } from './shared/constant';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      // 全站唯一一處設 <html lang> 的地方 —— 少了它，螢幕閱讀器讀不出正確語音，
      // 瀏覽器也可能拿日文或簡中字型渲染 CJK（同一個漢字的字形會不一樣）。
      // 用 zh-Hant-TW 而非 zh-TW：前者明確標出「正體字 + 台灣」，後者只有地區。
      htmlAttrs: { lang: 'zh-Hant-TW' },
    },
  },
  ui: {
    colorMode: false,
  },
  typescript: {
    typeCheck: true,
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/test-utils/module',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/fonts',
    '@vercel/speed-insights',
    '@vueuse/nuxt',
  ],

  // @nuxt/fonts：build 時 self-host 字型，取代 app.vue 原本的 Google Fonts CDN <link>
  // （移除 render-blocking 外部 stylesheet）。預設 processCSSVariables 'font-prefixed-only'
  // 會自動偵測 main.css 的 --font-* 變數。
  fonts: {
    families: [
      { name: 'Noto Serif TC', weights: [400, 500, 600, 700] },
      { name: 'Noto Sans TC', weights: [400, 500, 600, 700] },
      { name: 'JetBrains Mono', weights: [400, 500, 600] },
      // 字型堆疊中的 fallback —— 雖是 Google Fonts，但僅作本機 fallback，不下載
      { name: 'Inter', provider: 'none' },
      { name: 'IBM Plex Mono', provider: 'none' },
      { name: 'Shippori Mincho', provider: 'none' },
    ],
  },

  // @nuxt/image：先前等於沒生效，遠端原圖（1440x1440、平均 554KB）原尺寸穿透。
  //
  // provider 刻意不指定：module 的 detectProvider() 預設 'auto'，在 Vercel build 時
  // 由 std-env 認出環境並選 vercel provider；本機 build 則落回 ipx。寫死 'vercel' 會讓
  // 本機建置產出只有 Vercel 才解得開的 /_vercel/image URL。
  image: {
    // 遠端最佳化的白名單。不在清單內的絕對 URL 會在 runtime/image.js 的 validateDomains
    // 分支被原樣放行（不經任何處理）—— 這才是原本圖片沒被壓縮的根因。
    // 同時會寫進 Vercel build output 的 images.domains。
    //
    // 清單本身放在 shared/constant.ts，與 AGENTS 的照片 URL 同一個模組，並有測試
    // 斷言所有 picture / photos 的 host 都在其中；新增第三個 host 會直接測試失敗。
    domains: [...IMAGE_HOSTS],

    // vercel provider 只接受 screens 列出的寬度：給定的 width 會往上對齊到最近的值，
    // 沒給 width 則直接用最大值。預設 screens 最小是 640，但本站圖片最寬只渲染到
    // 448px，沿用預設等於每張都被推到 640 以上。故補上貼合實際渲染尺寸的階梯，
    // 每組為 1x 與 2x（densities 預設 [1, 2]）。
    //
    // 注意這裡與預設 screens 是「合併」不是取代 —— 實測 build 產出的
    // .vercel/output/config.json，images.sizes 仍含 640/768/1024/1280/1536。
    // 因此 4 個呼叫點都必須顯式給 width，漏寫會退化成 1536。
    screens: {
      portrait: 88, // AgentPortrait 頭像
      portrait2x: 176,
      profile: 240, // AgentProfile 個人頁大頭照
      card: 360, // AgentCard 圖鑑卡（4:3，跨斷點實測 286–343px）
      carousel: 448, // AgentPhotoCarousel
      profile2x: 480,
      card2x: 720,
      carousel2x: 896,
    },

    // vercel provider 未指定 quality 時會送 q=100。
    quality: 80,
  },

  // Vercel 對遠端圖的快取 TTL＝max(上游 Cache-Control max-age, minimumCacheTTL)，
  // 而 @nuxt/image 的 providerSetup.vercel 把 minimumCacheTTL 寫死成 300 秒。
  // 實測上游：uploadthing 送 max-age=86400（1 天）、houseprice 送 31536000（1 年）
  // → 掛在 uploadthing 的 28 張每天過期一次，過期後首次請求會重新計一次
  // image transformation（Vercel 對 MISS / STALE 都計費），Hobby 每月只有 5,000 次。
  // 拉到 31 天（Vercel 文件建議值）讓兩個 host 的行為一致。
  // 這裡蓋得掉模組預設，是因為 providerSetup 用 defu(nuxt.options.nitro, {...})，
  // 使用者設定優先。
  nitro: {
    vercel: {
      config: {
        images: {
          minimumCacheTTL: 60 * 60 * 24 * 31,
        },
      },
    },
  },

  runtimeConfig: {
    gsheetsKey: '',
    spreadsheetId: '',
    public: {
      // canonical 與 og:url 必須是絕對網址（相對路徑會被 LINE / Facebook 直接忽略），
      // 而站台自己不知道對外的網域是哪一個。預設值指向目前的 Vercel production URL，
      // 日後換自訂網域時只要設 NUXT_PUBLIC_SITE_URL，不必動程式碼。
      siteUrl: 'https://shuna-shift.vercel.app',
    },
  },
});
