// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here

  // 重設計原型 / handoff 包，不納入 lint
  {
    ignores: ['shuna-redesign/**'],
  },
)
