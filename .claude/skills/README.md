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
for s in nuxt nitro vue-best-practices vue-testing-best-practices vue-router-best-practices; do
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
| `vue-router-best-practices` | vuejs-ai/skills | **注意：內容寫的是 Vue Router 4，本專案用 5.0.6。** 主要建議（guard 用 return、不要用 `next()`）在 5 仍成立，但版本相關細節請以官方文件為準。本專案目前也沒有 middleware 或 route guard，這支的實際用處最小 |
