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
app/stores/schedule.ts（Pinia） → 前端快取班表資料，計算今日班表
app/composables/useAgent.ts     → 過濾特定探員的排班
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

兩支 API 均使用 `defineCachedEventHandler`：
- `/api/sheet` → 快取 3 小時
- `/api/statistics` → 快取 6 小時

前端 statistics 頁面另有 2 小時的 client-side 快取（比對 `metadata.lastUpdated`）。

## 測試檔案位置

測試檔案與原始碼並置在 `test/` 子目錄：

| 類型 | 路徑規則 | 執行環境 |
|------|---------|---------|
| unit | `server/**/test/**/*.spec.ts` | node |
| unit | `app/**/test/unit/**/*.spec.ts` | node |
| nuxt | `app/**/test/nuxt/**/*.spec.ts` | nuxt |

## 型別定義位置

所有共用型別定義在 `shared/types/index.ts`，前後端均可引用（使用 `~~/shared/types` 路徑別名，`~~` 指向專案根目錄）。
