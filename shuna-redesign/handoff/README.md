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

### 目前進度

- ✅ **Phase 0** — 設計系統 tokens（已合併）
- ✅ **Phase 1** — App Shell：Header / Footer / BrandMark（已合併）
- ⏭️ 下一個：**Phase 2** — 抽出 PageHeader

接手前先 `git log --oneline` 確認已合併到哪個 Phase。

### Phase 交接提示詞範本

換 session 接手下一個 Phase 時，複製下面這段，只改 **① Phase 編號 ② 任務一句話 ③ 子分支名稱** 三處：

```
你正在接手「朱雫查班工具」的 UI/UX redesign，整合分支是 refactor/uiux-redesign。
請執行 Phase 2。先用 git log --oneline 確認前面的 Phase 已合併。

開始前先讀：
- shuna-redesign/handoff/DEV_PLAN.md（§ 對應 Phase 的任務清單與完成標準）
- shuna-redesign/handoff/DESIGN_GUIDELINE.md（元件規格）
- prototype 原始碼：shuna-redesign/components.jsx、pages.jsx、app.css

任務：執行 Phase 2 — 抽出 PageHeader 元件，替換 shifts / agents / statistics
各頁手刻的標題區塊。完成後停下，不要進下一個 Phase。

務必遵守：
1. 子分支名用連字號 refactor/uiux-redesign-phase-2-page-header
   不可用斜線 —— refactor/uiux-redesign 已是分支，斜線子路徑會因 Git ref 階層衝突建立失敗
2. PR 的 base 必須是 refactor/uiux-redesign，不是 main
3. commit message 用合規 type（feat / fix / refactor / docs / test / chore），
   不要用 phase-N: 當前綴
4. 完成後跑 pnpm build / lint / typecheck，並用 playwright 截圖驗收桌機 + 手機
5. 新元件要附單元測試
6. commit + push + 開 PR（base 指定 refactor/uiux-redesign）

PR 開好後等 reviewer 審查；複審通過後再 squash 合併。
```

> Tailwind 優先用 `@theme` 產出的 utility，複雜元件 fallback 到 `components.css`。
> 各 Phase 的具體任務與完成標準都在 `DEV_PLAN.md`，接手的 session 自行閱讀。

## 給設計 / PM 的起手指令

開 `shuna-redesign/index.html`，切換右下角的 Tweaks 面板看四種色系。
最終正式版鎖定：**朱 (shu) ／ 預設字型 ／ 舒適密度**。
