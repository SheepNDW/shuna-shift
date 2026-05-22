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

  runtimeConfig: {
    gsheetsKey: '',
    spreadsheetId: '',
  },
});
