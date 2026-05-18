# 朱雫查班工具 — Redesign Handoff

這個資料夾是給開發者（或 Claude Code）的交付包。

## 檔案結構

```
shuna-redesign/
├── index.html              ← 可互動 prototype（最終視覺基準）
├── tokens.css              ← 設計系統 CSS 變數（直接複製到專案）
├── app.css                 ← 元件樣式（拆分到各 SFC 的參考來源）
├── components.jsx          ← 共用元件實作（PageHeader / AgentChip ...）
├── pages.jsx               ← 5 個頁面實作
├── app.jsx                 ← Router + Tweaks 整合
├── data.js                 ← Mock 資料（正式專案改用 useScheduleStore）
└── handoff/
    ├── README.md           ← 你正在看的這份
    ├── DESIGN_GUIDELINE.md ← 設計系統規範（tokens / 元件目錄 / Do's & Don'ts）
    ├── DEV_PLAN.md         ← 7 階段開發計畫
    └── phase-0/            ← Phase 0 可直接覆蓋的檔案（main.css / components.css / app.config.ts ...）
```

## 給 Claude Code 的標準起手指令

> ⚠️ **本次 redesign 的整合主分支為 `refactor/uiux-redesign`。**
> 所有 Phase 子分支都從這裡開、PR 回這裡，**不要直接合進 `main`**。
> 詳見 [`DEV_PLAN.md` § 1 分支策略](./DEV_PLAN.md#1-進度分段)。

### Phase 0（已預先產出檔案）

```
You are working on the朱雫 redesign on branch refactor/uiux-redesign.

1. Verify current branch is refactor/uiux-redesign. If not, switch:
   git checkout refactor/uiux-redesign && git pull
2. Create phase branch:
   git checkout -b refactor/uiux-redesign/phase-0-tokens
3. Read shuna-redesign/handoff/phase-0/README.md.
4. Copy files from shuna-redesign/handoff/phase-0/app/** to app/**
   preserving the directory structure.
5. Run the dark-mode strip command and verify with pnpm dev.
6. Commit, push, open PR against base refactor/uiux-redesign.
   DO NOT target main.
```

### Phase 1 之後

```
You are working on the朱雫 redesign on branch refactor/uiux-redesign.

1. git checkout refactor/uiux-redesign && git pull
2. git checkout -b refactor/uiux-redesign/phase-N-xxx
3. Read shuna-redesign/handoff/DEV_PLAN.md and DESIGN_GUIDELINE.md.
4. Execute Phase N only. Reference shuna-redesign/components.jsx and pages.jsx
   for component structure. Use Tailwind utilities from the @theme block where
   possible, fall back to components.css patterns for complex elements.
5. Commit, push, open PR against base refactor/uiux-redesign. DO NOT target main.
```

## 給設計 / PM 的起手指令

開 `shuna-redesign/index.html`，切換右下角的 Tweaks 面板看四種色系。
最終正式版鎖定：**朱 (shu) ／ 預設字型 ／ 舒適密度**。
