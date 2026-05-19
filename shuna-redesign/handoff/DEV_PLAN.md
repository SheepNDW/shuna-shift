# 朱雫查班工具 — 重新設計開發計畫
> 目標：將 `shuna-redesign/` prototype 整合進現有 Nuxt 4 專案 `shuna-shift/`
> Last updated: 2026-05-18

---

## 0. 前置作業

**Prototype 對照表**

| Prototype | 對應現有檔案 |
|---|---|
| `tokens.css` | `app/assets/css/main.css` （目前只有兩行 import，需大幅擴充） |
| `app.css` | 拆分到各 SFC 的 `<style>` 區塊，或建立 `app/assets/css/components.css` |
| `components.jsx` | `app/components/*.vue`（部分新增、部分重寫） |
| `pages.jsx` | `app/pages/*.vue`（5 個頁面全部重寫） |
| `data.js` | 不需要 — 真實資料來自 `useScheduleStore` |

**閱讀順序**

開發者開始前請先看：
1. 本檔（DEV_PLAN.md）
2. [`DESIGN_GUIDELINE.md`](./DESIGN_GUIDELINE.md)
3. Prototype 原始碼：`tokens.css` → `app.css` → `components.jsx` → `pages.jsx`

---

## 1. 進度分段

依風險與相依性分為 **7 個 Phase**。每 Phase 結束後獨立 commit、開 PR、code review。

### 🌿 分支策略（本次 redesign 專用）

**本次 redesign 的整合主分支為 `refactor/uiux-redesign`。**

- `main` 永遠保持當前線上穩定版，不直接受 redesign 影響
- `refactor/uiux-redesign` 是 redesign 的長期分支，**所有 Phase 都從這裡開分支、PR 回這裡**
- 每個 Phase 開一條 `refactor/uiux-redesign-phase-N-xxx` 子分支（**分支名用連字號，不可用斜線** — 見下方 ⚠️）
- Phase 子分支完成 → PR 合回 `refactor/uiux-redesign`（**不**合進 `main`）
- 整個 redesign（Phase 0–7）全數完成、QA 通過後，再用一個總合 PR 把 `refactor/uiux-redesign` 合進 `main`

```
main
 └── refactor/uiux-redesign            ← redesign 整合主分支（長期存在）
      ├── refactor/uiux-redesign-phase-0-tokens       → PR → refactor/uiux-redesign
      ├── refactor/uiux-redesign-phase-1-shell        → PR → refactor/uiux-redesign
      ├── refactor/uiux-redesign-phase-2-page-header  → PR → refactor/uiux-redesign
      ├── refactor/uiux-redesign-phase-3-home         → PR → refactor/uiux-redesign
      ├── refactor/uiux-redesign-phase-4-shifts       → PR → refactor/uiux-redesign
      ├── refactor/uiux-redesign-phase-5-agents       → PR → refactor/uiux-redesign
      ├── refactor/uiux-redesign-phase-6-statistics   → PR → refactor/uiux-redesign
      └── refactor/uiux-redesign-phase-7-polish       → PR → refactor/uiux-redesign

      ↓ 全部 Phase 完成、QA 通過後 ↓
      refactor/uiux-redesign  → PR → main   (一次性合併)
```

> ⚠️ **子分支名一律用連字號 `refactor/uiux-redesign-phase-N-xxx`，不可用斜線。**
> `refactor/uiux-redesign` 本身已是分支，而 Git 的 ref 以檔案系統階層儲存 ——
> 同一名稱不能同時是分支（檔案）又是目錄，`refactor/uiux-redesign/phase-N-xxx`
> 會以 `cannot lock ref` 建立失敗。

> ⚠️ **commit message 用合規 type**（`feat` / `fix` / `refactor` / `docs` / `test` /
> `chore` / `perf` / `ci`），**不要用 `phase-N:` 當前綴** —— `phase-N` 不是合法 type。
> squash 合併時的 commit subject 同樣要用合規 type（PR 標題可保留 `phase-N:` 作為人類辨識用）。

**每個 Phase 的標準操作流程**

```bash
# 1. 從 refactor/uiux-redesign 拉最新
git checkout refactor/uiux-redesign
git pull

# 2. 開 Phase 子分支（分支名用連字號，不可用斜線）
git checkout -b refactor/uiux-redesign-phase-N-xxx

# 3. 執行 Phase 任務 (人 or Claude Code)

# 4. Commit + push + 開 PR
git add .
git commit -m "<type>: <一句話描述>"   # type 用 feat/fix/refactor… 不可用 phase-N:
git push -u origin refactor/uiux-redesign-phase-N-xxx
gh pr create --base refactor/uiux-redesign --title "phase-N: <主題>"

# 5. Review merge → 進下一 Phase
```

**好處**

- `main` 與線上版本完全隔離，重做途中要 hotfix 也不受影響
- 每 Phase PR 範圍可控（幾百行內），review 容易
- redesign 期間如要 demo 給 stakeholder，直接看 `refactor/uiux-redesign` 預覽部署
- 最後一次性合進 `main`，release notes 也好寫

### Phase 0：設計系統建立（基礎，全站受影響）

**估時**：1 天

> ⚡ **已產出可直接覆蓋的檔案**：見 [`phase-0/`](./phase-0/README.md)
> 包含 `main.css`（含 Tailwind v4 `@theme` 區塊）、`components.css`、`app.config.ts`、`app.vue`、`default.vue`

**任務**

- [ ] 0.1　覆蓋 `app/assets/css/main.css`（新版含 `@theme` token，產生 `bg-paper` `text-ink` `bg-shu` 等 utility）
- [ ] 0.2　新建 `app/assets/css/components.css`（複雜元件 CSS，已被 main.css `@import`）
- [ ] 0.3　覆蓋 `app/app.config.ts`（primary 走 `@theme` alias，等於 shu）
- [ ] 0.4　覆蓋 `app/app.vue`（補 Google Fonts useHead）
- [ ] 0.5　覆蓋 `app/layouts/default.vue`（移除 pink/purple/blue 漸層 + dark mode）
- [ ] 0.6　全站 `rg "dark:"` → 0；用 sed 全砍：`find app -name '*.vue' -exec sed -i '' -E 's/dark:[a-zA-Z0-9_\/\-]+ ?//g' {} +`
- [ ] 0.7　`pnpm dev` 啟動，任一頁加測試卡片驗收（見 `phase-0/README.md` Step 5）

**完成標準**：tokens 全可用、dark mode 全砍乾淨、紙感底色 + 朱紅 utility 都可用。各頁樣式會亂掉（pink-500 等 utility 已失效），下個 Phase 再修。

---

### Phase 1：App Shell（Header / Footer / Layout）

**估時**：0.5 天

**任務**

- [ ] 1.1　重寫 `app/components/AppHeader.vue`：4 個漢字 nav + brand stamp + 預約 CTA
- [ ] 1.2　重寫 `app/components/AppFooter.vue`：三欄資訊（頁面 / 營業 / 資料）
- [ ] 1.3　新增 `app/components/BrandMark.vue`：朱字章
- [ ] 1.4　修改 `app/layouts/default.vue`：移除 body 漸層（`from-pink-50 via-purple-50 to-blue-50`），改為 `paper-grain` class
- [ ] 1.5　新增全站「紙感」CSS overlay（`.paper-grain::before`，prototype `tokens.css`）

**完成標準**：所有頁面背景都是紙感奶油，nav 是漢字 + 朱紅 active state，無漸層出現。

---

### Phase 2：抽出 PageHeader（清掉重複手刻）

**估時**：0.5 天

**任務**

- [ ] 2.1　新增 `app/components/PageHeader.vue`，props：`kanji` `label` `title` `subtitle?` `meta?`
- [ ] 2.2　替換 `pages/shifts.vue` 開頭的標題區塊
- [ ] 2.3　替換 `pages/agents/index.vue` 開頭的標題區塊
- [ ] 2.4　替換 `pages/statistics.vue` 開頭的標題區塊（如有）
- [ ] 2.5　`agents/[id].vue` 改用 `Breadcrumb`（見 Phase 5）— 此頁不用 PageHeader

**完成標準**：搜尋 `bg-clip-text text-transparent` 與 `bg-linear-to-r from-pink-600 to-purple-600` 在頁面層級皆為 0 次。

---

### Phase 3：首頁 `/` 重做（資訊密度提升）

**估時**：1.5 天

**任務**

- [ ] 3.1　新增 `app/components/GreetingHeader.vue`（重寫）— 招呼語 + 印章式日期框
- [ ] 3.2　新增 `app/components/ShiftColumn.vue`（取代現有「Day Shift Section」/「Night Shift Section」整段手刻）
- [ ] 3.3　新增 `app/components/AgentPortrait.vue`（圓頭像 + 探員色 ring；取代 `AgentCard.vue` 在首頁的角色 — 注意：`AgentCard` 與 `AgentListCard` 是雙生件，建議合併為單一 `AgentPortrait` + variant prop）
- [ ] 3.4　新增 `app/components/UpcomingCard.vue`（首頁底部近日預覽 4 卡）
- [ ] 3.5　重寫 `app/pages/index.vue`：hero band + today grid + upcoming + CTA
- [ ] 3.6　修掉現有 `transform hover:scale-105` 在日期卡的誤導 hover

**完成標準**：首頁手機橫向滾不到一頁就能看到早晚班，桌面 above-the-fold 同時看到兩班。

**新增檔案**

```
app/components/
  GreetingHeader.vue   (重寫)
  ShiftColumn.vue      (新)
  AgentPortrait.vue    (新；可合併 AgentCard + AgentListCard)
  UpcomingCard.vue     (新)
```

---

### Phase 4：完整班表 `/shifts` 重做

**估時**：1 天

**任務**

- [ ] 4.1　新增 `app/components/FilterBar.vue`：探員 chip 篩選 + 日期跳轉，取代現有 `ScheduleFilter` + `DateJumper` 的 `backdrop-blur` 玻璃卡片
- [ ] 4.2　新增 `app/components/AgentChip.vue`（取代散落各處的探員 pill 寫法）
- [ ] 4.3　重寫 `app/components/DailyScheduleCard.vue`：左 DateTag、右 ShiftRow×2，is-today 加左側朱紅實線
- [ ] 4.4　新增 `app/components/DateTag.vue`（mono 數字 + serif 星期）
- [ ] 4.5　新增 `app/components/ShiftRow.vue`（label + agents 並列）
- [ ] 4.6　移除現有的「副標文案 — 查看表單最近已排班日期的值班安排」（語句不通），改為動態 `{X} 日 · {first} – {last}`
- [ ] 4.7　調整 `pages/shifts.vue` 使用上述新元件

**完成標準**：篩選 chip 點擊跳色為探員色，is-today 卡片左側有朱紅實線，無 `backdrop-blur`。

---

### Phase 5：探員圖鑑 `/agents` + 探員頁 `/agents/[id]`

**估時**：1 天

**任務**

- [ ] 5.1　合併 `AgentCard.vue` 與 `AgentListCard.vue` → 單一 `AgentCard.vue`，支援 `variant: 'compact' | 'portrait' | 'full'`
- [ ] 5.2　重寫 `pages/agents/index.vue`：用 `AgentSection`（正職 / 現役）取代兩段不同色 pill section
- [ ] 5.3　新增 `app/components/AgentSection.vue`
- [ ] 5.4　重寫 `pages/agents/[id].vue`：新增 `Breadcrumb` + `AgentProfile`（檔案編號 + 大頭照 + 三個統計）
- [ ] 5.5　重寫 `app/components/agent/AgentProfile.vue`（已存在但需翻新）
- [ ] 5.6　重寫 `app/components/agent/AgentScheduleCard.vue` 為 `schedule-row` 表格樣式
- [ ] 5.7　將 `AgentPhotoCarousel.vue` 重新樣式化（保留功能、移除漸層邊框）

**完成標準**：探員頁有 `AGENT FILE No.XXX` 編號、近三個月日 / 夜 / 總三格統計，正職 / 現役兩段使用同一視覺語言、僅以 `FULL` mini-tag 區分。

---

### Phase 6：統計頁 `/statistics`

**估時**：0.5 天

**任務**

- [ ] 6.1　新增 `app/components/SummaryTile.vue`：4 格摘要（日總 / 夜總 / 總計 / MVP）
- [ ] 6.2　重寫 `app/components/StatisticsTable.vue` 為 prototype 中的 `stat-table` 樣式：排名 + 探員 + stacked bar + 數字
- [ ] 6.3　新增 stacked bar 元件 `StatBar.vue`（早班用 `--color-day`、晚班用 `--color-night`）
- [ ] 6.4　重寫 `pages/statistics.vue`：PageHeader + SummaryTiles + StatisticsTable
- [ ] 6.5　砍掉現有 emerald 配色（圖例的 yellow/indigo 圓圈與其他頁不一致）

**完成標準**：統計頁色彩語意與 shifts 頁一致；MVP 卡片顯示榜首探員與班次拆分。

---

### Phase 7：收尾 / 共用元件 / 清理

**估時**：0.5 天

**任務**

- [ ] 7.1　新增 `app/components/EmptyState.vue` 並替換現有 5 處不一致的 empty state（首頁無排班 / shifts 無未來 / shifts 篩選無結果 / agents 無探員 / 探員頁無排班）
- [ ] 7.2　新增 `app/components/SectionRule.vue`（髮絲線 + 中心 ornament）
- [ ] 7.3　重寫 `BackToTop.vue` 為簡單朱紅小圓鈕（不要漸層）
- [ ] 7.4　重寫 `ColorLegend.vue` 為紙感區塊（用於開發者 / debug，不放主流程）
- [ ] 7.5　重寫 `LoadingState.vue`：簡單骨架 + 「資料載入中…」serif 字
- [ ] 7.6　全站 grep 確認：
   - `bg-linear-to` → 0 次
   - `from-pink-` `from-purple-` `to-pink-` `to-purple-` → 0 次
   - `dark:` → 0 次
   - `rounded-2xl` `rounded-3xl` → 0 次（改為 `--r-lg`）
   - `shadow-lg` `shadow-2xl` `shadow-xl` → 0 次
   - `bg-clip-text text-transparent` → 0 次

**完成標準**：上述 grep 全 0，全站視覺一致。

---

## 2. 元件 mapping 速查表

| 新元件 | 取代 | 備註 |
|---|---|---|
| `PageHeader` | shifts/statistics/agents 各自手刻 | Phase 2 |
| `BrandMark` | （無） | Phase 1 |
| `AgentChip` | shifts 中散落的探員 pill | Phase 4 |
| `AgentPortrait` | 首頁 `AgentCard` | Phase 3 |
| `AgentCard` 合併 | `AgentCard` + `AgentListCard` | Phase 5 |
| `AgentSection` | agents 兩段不同色 section | Phase 5 |
| `AgentProfile` | （翻新） | Phase 5 |
| `DailyCard` | `DailyScheduleCard` | Phase 4 |
| `DateTag` | 散落於各頁的日期顯示 | Phase 4 |
| `ShiftRow` | 早晚班整段手刻 | Phase 4 |
| `ShiftColumn` | index.vue Day/Night Shift Section | Phase 3 |
| `UpcomingCard` | （無） | Phase 3 |
| `FilterBar` | `ScheduleFilter` + `DateJumper` 玻璃卡 | Phase 4 |
| `StatisticsTable` (翻新) | 現有版本 | Phase 6 |
| `SummaryTile` | （無） | Phase 6 |
| `StatBar` | （無） | Phase 6 |
| `EmptyState` | 5 處不一致 empty state | Phase 7 |
| `SectionRule` | 散落漸層 hr | Phase 7 |

---

## 3. 程式碼 conventions

- 元件以 `<script setup lang="ts">` 撰寫
- **樣式採 utility-first**：layout / 間距 / 字級 / 色彩 / 圓角 / 陰影一律用 Tailwind utility class
  - 色彩走 `@theme` 客製 token（`bg-paper` / `text-shu` / `border-rule` …）
  - 字級用 `@theme` 的 `text-fs-*`（對應 DESIGN_GUIDELINE §2.2 字級階梯）
  - 間距用 Tailwind 內建 scale（`gap-3` / `p-6` …，對應 4-based 階梯）
- 重複的小樣式（`stamp-label` / `kanji-mark` / `btn` / `date-stamp-frame` …）定義為
  `@layer components` class，集中於 `components.css`
- `<style scoped>` 只保留 utility 無法表達者：偽元素裝飾、帶 CSS 變數的多層 box-shadow 等
- 探員代表色透過 inline style 設 `--agent-color` CSS variable，元件用 `var(--agent-color)` 引用（**不要**把顏色硬編到 class）
- 「今日」、「過期」、「未來」狀態用 boolean prop 控制，不要用 class string

範例：

```vue
<template>
  <div class="agent-chip" :class="{ 'is-highlighted': highlighted }"
       :style="{ '--agent-color': agent.color }">
    <span class="agent-chip__dot" />
    <span class="agent-chip__name">{{ agent.name }}</span>
  </div>
</template>
```

---

## 4. 測試策略

- **單元測試**：保留現有 `composables/test`、`utils/test`、`stores/test` 測試，新增 `PageHeader` / `AgentChip` / `DailyCard` 的 props 渲染測試
- **視覺驗證**：每個 Phase 完成後跑 `pnpm dev`，比對 prototype `shuna-redesign/index.html` 的相同畫面
- **a11y 檢查**：跑 Lighthouse a11y score 應 ≥ 95（目前漸層文字常掉到 80）
- **建議 e2e**：保留現有 nuxt 測試框架，補一個 smoke test 點過 5 個路由不爆

---

## 5. 風險與權衡

| 風險 | 緩解 |
|---|---|
| @nuxt/ui 的預設樣式跟新 token 打架 | 在 `app.config.ts` 把 primary / neutral 重設，必要時加 `:where()` 包裝降低優先級 |
| 漸層拿掉後使用者覺得「太樸素」 | 用 Tweaks 預留 `matcha` `yuzu` 色系作為節慶切換 |
| 探員代表色文字對比不足 | 統計頁 / 篩選 chip 已避免將代表色用於小字；探員名字維持代表色但配 16-22px 字級 |
| 重做 5 頁範圍大 | 按 Phase 分支 / 漸進合併；每 Phase 都能獨立 ship |
| 移除 dark mode 後使用者抗議 | 目前 `colorMode: false` 已是死碼，沒有使用者**實際**用過；可日後重啟（用 token + `data-theme="dark"`） |

---

## 6. 給 Claude Code 的 prompt 範例

> 任務：執行 Phase 0 — 設計系統建立
>
> 0. **確認目前在 `refactor/uiux-redesign-phase-0-tokens` 分支**（從 `refactor/uiux-redesign` 開出）。若不在請：
>    ```bash
>    git checkout refactor/uiux-redesign && git pull
>    git checkout -b refactor/uiux-redesign-phase-0-tokens
>    ```
> 1. 讀 `shuna-redesign/handoff/phase-0/README.md`
> 2. 把 `shuna-redesign/handoff/phase-0/app/**` 全部拷貝到 `app/**`，保持路徑結構
> 3. 全站 sed / grep 刪除所有 `dark:` class（保留 `nuxt.config.ts` 的 `colorMode: false`）
> 4. 跑 `pnpm dev`，確認啟動成功（各頁視覺會亂掉是預期的，下個 Phase 修）
> 5. 任一頁加 README 中的測試卡片，確認紙感 + 朱紅按鈕都正常
> 6. `git commit -m "feat: design tokens + remove dead dark mode"`
> 7. `git push -u origin refactor/uiux-redesign-phase-0-tokens`
> 8. `gh pr create --base refactor/uiux-redesign --title "phase-0: design tokens + remove dead dark mode"`
> 9. 不要進 Phase 1，等 review

逐 Phase 重複，**每個 Phase 都從 `refactor/uiux-redesign` 開分支、PR 回 `refactor/uiux-redesign`**。建議一次只交付一個 Phase 給 Claude Code，PR review 後再進下一階段。

---

## 7. 預估總工時

| Phase | 估時 |
|---|---|
| 0 設計系統 | 1 天 |
| 1 App Shell | 0.5 天 |
| 2 PageHeader | 0.5 天 |
| 3 首頁 | 1.5 天 |
| 4 shifts | 1 天 |
| 5 agents | 1 天 |
| 6 統計 | 0.5 天 |
| 7 收尾 | 0.5 天 |
| **合計** | **約 6.5 天** |

人類獨立開發。Claude Code 並行可壓縮到 **2-3 天**（每 Phase 1-2 小時 + 人工 review）。
