// ============================================================
// 朱雫 — app.config.ts
// @nuxt/ui v3：colors.primary 直接指向 @theme 內實際存在的 shu palette
// （--color-shu-*）。不可寫 'primary' 自我參照 —— Tailwind v4 會 tree-shake
// 掉未被任何 utility 使用的 @theme 變數，使 --color-primary-* 落空成空值。
// ============================================================

export default defineAppConfig({
  title: '朱雫查班工具',
  ui: {
    colors: {
      primary: 'shu', // 朱紅品牌色
      neutral: 'stone', // 暖灰，與紙感底色協調
    },
  },
});
