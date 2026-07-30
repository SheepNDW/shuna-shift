// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
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
    '@pinia/nuxt',
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
    domains: ['image-dev.houseprice.tw', 'o8ilaibv5w.ufs.sh'],

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

  runtimeConfig: {
    gsheetsKey: '',
    spreadsheetId: '',
  },
});
