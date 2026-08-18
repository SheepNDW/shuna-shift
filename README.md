# 朱雫查班工具

[喫茶 朱雫](https://www.instagram.com/shuna.maidcafe/) Maid Café 的**非官方**班表查詢工具。從店家公開的 Google 試算表讀取排班，整理成好查的今日班表、完整班表、探員圖鑑與出勤統計。

**線上版：** <https://shuna-shift.vercel.app>

## 技術棧

Nuxt 4（SSR）· Vue 3 `<script setup>` · @nuxt/ui 4 · Tailwind CSS 4 · Vitest · 部署於 Vercel

## 快速開始

需要 Node.js 24 以上（見 `.nvmrc`）與 pnpm。

```bash
pnpm install
cp .env.example .env   # 填入下方兩個變數
pnpm dev               # http://localhost:3000
```

### 環境變數

| 變數 | 說明 |
|---|---|
| `NUXT_GSHEETS_KEY` | Google Sheets API Key（需開啟 Google Sheets API） |
| `NUXT_SPREADSHEET_ID` | 班表試算表的 ID |
| `NUXT_PUBLIC_SITE_URL` | 選填。canonical 與 og:url 用的站台網址，預設為正式站網址 |

## 常用指令

```bash
pnpm dev          # 開發伺服器
pnpm build        # 正式環境建置
pnpm preview      # 預覽建置結果
pnpm lint         # ESLint 檢查（--fix 版本為 pnpm lint:fix）
pnpm typecheck    # TypeScript 型別檢查
pnpm test         # 全部測試（watch）
pnpm test:unit    # 只跑 unit（node 環境）
pnpm test:nuxt    # 只跑元件測試（nuxt 環境）
```

執行單一測試檔：

```bash
pnpm vitest run server/utils/test/parser.spec.ts
pnpm vitest run --project=nuxt app/components/test/nuxt/AgentCard.spec.ts
```

## 資料流

```
Google Sheets API
  └─ server/api/sheet.get.ts        當期班表（CDN 快取 3 小時）
  └─ server/api/statistics.get.ts   歷史 + 當期，算近三個月統計（CDN 快取 6 小時）
        └─ server/utils/            transformer / parser / statistics
              └─ app/composables/   useSchedules / useStatistics / useAgent
                    └─ app/pages/
```

排班本身由店家在試算表維護，本站只做讀取與呈現，不寫回任何資料。

## 專案結構

```
app/          前端（Nuxt 4 srcDir）：pages / components / composables / utils
server/       API route 與資料轉換、Sheets 存取、快取包裝
shared/       前後端共用：型別、探員名冊（AGENTS）、日期與顏色工具
docs/agents/  給 AI agent 的作業說明（issue tracker、triage 標籤等）
```

測試檔與原始碼並置在各自的 `test/` 子目錄，`test/unit/` 走 node 環境、`test/nuxt/` 走 nuxt 環境。

## 更多說明

架構決策與各處「為什麼這樣寫」的來龍去脈寫在 [CLAUDE.md](./CLAUDE.md) 與程式碼註解裡 —— 動到 API 快取、圖片最佳化或探員名冊之前建議先讀。

## 免責

本站為粉絲自製工具，與喫茶 朱雫官方無關。班表以店家官方公告為準。
