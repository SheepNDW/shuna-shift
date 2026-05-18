// ============================================================
// 朱雫 — app.config.ts
// @nuxt/ui 的 color="primary" 會自動讀 --color-primary-* CSS var
// 我們已在 main.css 把 primary alias 到 shu palette，所以這裡只需
// 把 colors.primary 改成 ui 認可的 key name（保留作為 fallback 鍵名）。
// ============================================================

export default defineAppConfig({
  title: '朱雫查班工具',
  ui: {
    colors: {
      // @nuxt/ui v3：可以用 token name 字串，會去 main.css 的 @theme 找 --color-{name}-*
      // 因為 main.css 已把 --color-primary-* 設成 shu 系列，這裡用 'primary' 即等於 shu
      primary: 'primary',
      neutral: 'stone', // 暖灰，與紙感底色協調
    },
  },
});
