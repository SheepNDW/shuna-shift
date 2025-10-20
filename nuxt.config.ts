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

  modules: ['@nuxt/ui', '@nuxt/test-utils/module', '@nuxt/eslint', '@pinia/nuxt', '@nuxt/image'],

  runtimeConfig: {
    gsheetsKey: '',
    spreadsheetId: '',
  },
});