# Vendored skills

這幾個 skill 是從 [antfu/skills](https://github.com/antfu/skills)（MIT）複製進來的，
**不是**手寫的，改動請往上游提。

| 項目 | 值 |
|---|---|
| 來源 | https://github.com/antfu/skills |
| 取用 commit | `a74f281` |
| 取用日期 | 2026-08-15 |
| 授權 | MIT（見上游 `LICENSE.md`） |

## 為什麼用複製而不是 CLI 安裝

上游建議 `pnpx skills add antfu/skills`（[vercel-labs/skills](https://github.com/vercel-labs/skills)）。
這裡改用直接複製，理由是 skill 本身自包含（`SKILL.md` + `references/`，上游的
git submodule 只在「產生」階段用到），複製後不必為了讀文件多帶一個遠端 CLI
依賴，版本也釘得死。

## 更新方式

```bash
git clone --depth 1 https://github.com/antfu/skills.git /tmp/antfu-skills
for s in nuxt nitro vue-best-practices vue-testing-best-practices; do
  rm -rf ".claude/skills/$s" && cp -R "/tmp/antfu-skills/skills/$s" .claude/skills/
done
```

更新後記得回來改上表的 commit 與日期。

## 各 skill 與本專案的關係

| Skill | 上游來源 | 對本專案 |
|---|---|---|
| `nuxt` | 由 nuxt/nuxt 官方文件產生 | 最貼合。明寫 Nuxt 4 的 `app/` srcDir、`useAsyncData` / `useFetch` 快取、hybrid rendering 與 route rules |
| `nitro` | 由 nitro 官方文件產生 | `server/api/`、cache header、Vercel 部署行為 |
| `vue-best-practices` | vuejs-ai/skills | Composition API + TypeScript 慣例 |
| `vue-testing-best-practices` | vuejs-ai/skills | Vitest + Vue Test Utils + Playwright |

## 評估過但沒收的

| Skill | 不收的理由 |
|---|---|
| `vue-router-best-practices` | 內容寫的是 Vue Router 4，本專案用 5.0.6；且專案沒有 middleware 或 route guard，`app/pages/` 純檔案路由。路由需求變複雜時可再收 |
| `vueuse-functions` | 38KB、200+ function 的目錄。專案實際只用到 `useWindowScroll` / `usePreferredReducedMotion` 兩支（皆在 `app/components/BackToTop.vue`），不成比例。VueUse 用量長起來再收 |
| `antfu`、`antfu-design`、`unocss` | UnoCSS-first 加上游自己的 ESLint config，與本專案的 `@nuxt/ui` + `@nuxt/eslint` 衝突 |
| `pinia` | 專案沒有 Pinia |
| `vue`、`vitest`、`vite`、`pnpm`、`web-design-guidelines` | 與收下的四支或既有 global rules 重疊 |
| `slidev`、`vitepress`、`tsdown`、`turborepo` | 沒用到 |
