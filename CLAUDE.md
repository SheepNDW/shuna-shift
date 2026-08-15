# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

**朱雫查班工具** — 喫茶 朱雫 Maid Café 的班表查詢 Web App，從 Google Sheets 讀取排班資料後呈現。使用 Nuxt 4 + Vue 3 + @nuxt/ui 建置，部署於 Vercel。

## 常用指令

```bash
pnpm dev          # 啟動開發伺服器（http://localhost:3000）
pnpm build        # 正式環境建置
pnpm lint         # ESLint 檢查
pnpm lint:fix     # ESLint 自動修正
pnpm typecheck    # TypeScript 型別檢查

# 測試
pnpm test              # 執行所有測試（watch mode）
pnpm test:unit         # 只跑 unit 測試（node 環境）
pnpm test:nuxt         # 只跑 nuxt 元件測試（nuxt 環境）
```

執行單一測試檔：
```bash
pnpm vitest run server/utils/test/parset.spec.ts
pnpm vitest run --project=nuxt app/components/test/nuxt/ShiftCard.spec.ts
```

## 環境變數

`.env` 需設定（對應 `nuxt.config.ts` 的 `runtimeConfig`）：
```
NUXT_GSHEETS_KEY=       # Google Sheets API Key
NUXT_SPREADSHEET_ID=    # Google Spreadsheet ID
```

## 程式架構

### 資料流

```
Google Sheets API
    ↓
server/api/sheet.get.ts         → 取得當期班表（每日班表!A5:C45）
server/api/statistics.get.ts    → 取得歷史 + 當期班表後計算統計
    ↓
server/utils/transformer.ts     → 將 Sheets 原始 rowData 轉為 ShiftSchedule[]
server/utils/parser.ts          → 解析日期序號、顏色、探員名稱及文字格式
server/utils/statistics.ts      → 篩選近 3 個月、計算各探員日/夜班次數
    ↓
app/composables/useSchedules.ts  → 全站共用的班表資料，計算今日班表
app/composables/useStatistics.ts → 全站共用的出勤統計（帶 2 小時 TTL 快取）
app/composables/useAgent.ts      → 過濾特定探員的排班
    ↓
app/pages/                      → 頁面消費資料
```

### Google Sheets 資料格式

班表範圍 `每日班表!A5:C45`，歷史資料為 `過去班表20260101~!A5:C743`：
- **A 欄**：日期（Excel 序號，需轉換）或特殊說明文字（如節日名稱）
- **C 欄**：當班探員名稱，以 `、` 分隔，可帶 `textFormatRuns` 標記個別探員顏色
- **早班/晚班規則**：A 欄有日期的列為早班，緊接其後 A 欄空白的列為晚班（`mergeDayAndNightShifts`）

### 探員識別（`shared/constant.ts`）

`AGENTS` Map 的 key 為 **名字或 emoji**（正職探員用 emoji，如 `🐷 → 泠泠`）。班表中可能出現：
- 直接使用 emoji key（正職）
- 使用中文/英文名字（需不區分大小寫比對）
- 帶括號的替班記錄，例如 `小楓(泠泠)` → 統計時只計算 `小楓`
- 名稱別名（`NAME_ALIASES`），例如 `いろは → Iroha`

新增探員：在 `shared/constant.ts` 的 `AGENTS` Map 新增一筆，同時更新 `NAME_ALIASES`（若有別名）。

### API 快取

兩支 API 均使用 `server/utils/cache.ts` 的 `defineCdnCachedEventHandler`（包住 nitro 的 `defineCachedEventHandler`）：
- `/api/sheet` → 快取 3 小時
- `/api/statistics` → 快取 6 小時

之所以要包一層：直接把 opts 傳給 `defineCachedEventHandler` 時 `swr` 預設值不會生效，nitro 會吐出瀏覽器專用的 `max-age`，而 Vercel edge 對 function 回應只認 `s-maxage` → CDN 完全不會建立快取。wrapper 顯式給 `swr` / `staleMaxAge`，讓回應帶 `s-maxage=<maxAge>, stale-while-revalidate=60`（詳細推導見該檔註解）。

代價是**回應不再帶 `max-age`，瀏覽器端不快取** —— nitro 的 header 分支互斥，開了 `swr` 就拿不到 `max-age`。client-side 換頁時會真的發請求，但會終止在 edge 而非 origin。

`?nocache` 走 wrapper 的繞過分支：直接呼叫原 handler 並標 `cache-control: no-store`，避免繞過的回應被 CDN 用自己的 cache key 存起來。dev 環境（`import.meta.dev`）一律繞過。

前端另有一層 client-side 快取，兩支 API 的策略不同（皆在 `app/utils/cache.ts`）：

- 統計走 `makeTtlCache`，2 小時新鮮度上限（比對回應的 `metadata.lastUpdated`）。
- 班表走 `reusePayloadData`，不設時效，只保證「同一次 SSR / 同一個 session 內只抓一次」。

班表非得自己寫 `getCachedData` 不可：Nuxt 預設的那支在 server 端只讀 `nuxtApp.static.data`（SSR 當下是空的），於是同一次 SSR 裡 layout 的 footer 與頁面會各打一次 `/api/sheet`，光靠共用 asyncData key 擋不住。

## 測試檔案位置

測試檔案與原始碼並置在 `test/` 子目錄：

| 類型 | 路徑規則 | 執行環境 |
|------|---------|---------|
| unit | `server/**/test/**/*.spec.ts` | node |
| unit | `shared/**/test/**/*.spec.ts` | node |
| unit | `app/**/test/unit/**/*.spec.ts` | node |
| nuxt | `app/**/test/nuxt/**/*.spec.ts` | nuxt |

## 型別定義位置

所有共用型別定義在 `shared/types/index.ts`，前後端均可引用（使用 `~~/shared/types` 路徑別名，`~~` 指向專案根目錄）。

## 可用輔助 Skills

**遇到對應任務時主動呼叫。** 分兩批來源：

專案內附（`.claude/skills/`，vendor 自 [antfu/skills](https://github.com/antfu/skills)，來源與更新方式見該目錄的 README）：

| Skill | 何時用 |
|---|---|
| `nuxt` | 動 `nuxt.config.ts`、`app/` 目錄慣例、`useFetch` / `useAsyncData` 快取、rendering 模式與 route rules |
| `nitro` | 動 `server/api/`、cache header、Vercel 部署行為（`server/utils/cache.ts` 那套的守備範圍） |
| `vue-best-practices` | 寫新 SFC、refactor 既有 `<script setup>`、判斷 props/emit/composable 切分 |
| `vue-testing-best-practices` | 寫 `app/**/test/nuxt/*.spec.ts`，比對 `mountSuspended` + stub + `data-testid` 模式 |
| `vue-router-best-practices` | 動 `app/pages/`、middleware、route guard。**內容寫的是 Vue Router 4，本專案用 5.0.6**，版本相關細節以官方文件為準 |

已安裝的 `everything-claude-code` plugin：

| Skill | 何時用 |
|---|---|
| `/ecc:vue-review`（或 `ecc:vue-reviewer` agent） | 改完 `.vue` 或 composable 後的 review |
| `ecc:nuxt4-patterns` | 與內附的 `nuxt` 重疊，需要第二種角度時再拉 |

原本這裡列的是 `vue-skills-bundle` 的 `/vue-best-practices` 等 skill。2026-08-15 查證該 bundle 已不存在於任何已註冊的 marketplace（三個 marketplace 共 521 個 plugin，無 vue 相關項目）；其中三支的實際上游是 `vuejs-ai/skills`，已透過 antfu/skills 內附回來。目前仍沒有對應的是「響應性 debug」與 `create-adaptable-composable` 兩塊。

**不適用本專案**（已知，不要拉）：

- 任何 JSX 相關 —— 本專案用 SFC template，不寫 JSX
- 任何 Options API 相關 —— 本專案統一 `<script setup>` Composition API
- 任何 Pinia 相關 —— 本專案沒有 Pinia。班表與統計都是純 server state，由 `useSchedules` / `useStatistics` 直接持有；若日後真的需要 client state（例如跨頁保留 `/shifts` 的探員篩選），再評估要不要引入

呼叫慣例：與其他既有 skill（`/ecc:code-review`、`/plan` 等）相同 —— 在需要時透過 `Skill` 工具呼叫，使用者直接輸入 `/<skill-name>` 也可觸發。

## Agent skills

### Issue tracker

Issue 記錄在 GitHub Issues（`SheepNDW/shuna-shift`），透過 `gh` CLI 操作。詳見 `docs/agents/issue-tracker.md`。

### Triage labels

沿用五個標準 triage 標籤：`needs-triage`／`needs-info`／`ready-for-agent`／`ready-for-human`／`wontfix`。詳見 `docs/agents/triage-labels.md`。

### Domain docs

Single-context 佈局 —— 根目錄 `CONTEXT.md` + `docs/adr/`（皆為 lazy 建立，目前尚未存在）。詳見 `docs/agents/domain.md`。
