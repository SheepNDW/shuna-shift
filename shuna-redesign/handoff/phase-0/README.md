# Phase 0 — 設計系統建立（可直接複製版）

> 目標：把 prototype 的 tokens / 字型 / primary 色帶進現有 Nuxt 4 + @nuxt/ui v3 + Tailwind v4 專案，並砍掉死碼。

---

## 📂 此資料夾的檔案是「可直接覆蓋」

```
shuna-redesign/handoff/phase-0/
└── app/
    ├── assets/css/
    │   ├── main.css          ← 覆蓋現有
    │   └── components.css    ← 新建
    ├── app.config.ts         ← 覆蓋現有
    ├── app.vue               ← 覆蓋現有（補 useHead 載字型）
    └── layouts/
        └── default.vue       ← 覆蓋現有（移除漸層 + dark mode）
```

`shuna-redesign/handoff/phase-0/app/` 對應 `shuna-shift/app/`，路徑一一相對應。

---

## 🛠 Step-by-step

### 0. 開分支

> 本次 redesign 整合主分支 = `refactor/uiux-redesign`
> 每個 Phase 都從這裡開子分支、PR 回這裡，**不合進 `main`**

```bash
# 確認在主整合分支
git checkout refactor/uiux-redesign
git pull

# 開 Phase 0 子分支（分支名用連字號，不可用斜線）
git checkout -b refactor/uiux-redesign-phase-0-tokens
```

### 1. 拷貝檔案

```bash
# 在 shuna-shift/ 專案根目錄
cp ../shuna-redesign/handoff/phase-0/app/assets/css/main.css       app/assets/css/main.css
cp ../shuna-redesign/handoff/phase-0/app/assets/css/components.css app/assets/css/components.css
cp ../shuna-redesign/handoff/phase-0/app/app.config.ts             app/app.config.ts
cp ../shuna-redesign/handoff/phase-0/app/app.vue                   app/app.vue
cp ../shuna-redesign/handoff/phase-0/app/layouts/default.vue       app/layouts/default.vue
```

### 2. 全站砍 dark mode

```bash
# 先看一下有多少要砍
rg "dark:" app/ | wc -l

# 用 sed 全砍（macOS）— 此命令會移除任意 'dark:xxx-xxx' class
find app -name '*.vue' -exec sed -i '' -E 's/dark:[a-zA-Z0-9_/\-]+ ?//g' {} +

# 或 Linux
# find app -name '*.vue' -exec sed -i -E 's/dark:[a-zA-Z0-9_\/\-]+ ?//g' {} +

# 跑完再驗
rg "dark:" app/  # 應該 0 個 match
```

### 3. 確認 `nuxt.config.ts`

現有 `colorMode: false` 已正確，無需改動。確認以下行存在：

```ts
css: ['~/assets/css/main.css'],
ui: {
  colorMode: false,
},
```

### 4. 測試啟動

```bash
pnpm dev
```

預期：
- 背景變成奶油紙感色（不再是粉紫藍漸層）
- 字體變成 Noto Serif TC / Noto Sans TC（網路抓不到時 fallback 系統字）
- 各頁面**樣式會亂掉**，因為 `pink-500` 等 utility 還沒換 — 這是預期的，下個 Phase 處理

### 5. 驗收

在隨便一個頁面加：

```html
<div class="bg-paper text-ink p-6 rounded-lg hairline-b">
  <h2 class="serif text-2xl">朱雫測試</h2>
  <p class="stamp-label">DESIGN TOKEN · 紙感卡片</p>
  <button class="bg-shu hover:bg-shu-deep text-white px-4 py-2 rounded-md mt-3">
    朱紅按鈕
  </button>
</div>
```

如果這塊呈現紙感 + 朱紅按鈕，Phase 0 完成。

---

## 🎁 你拿到了什麼 Tailwind utility

`main.css` 的 `@theme` 區塊讓你能直接寫：

| Tailwind class | 對應 |
|---|---|
| `bg-paper` / `bg-paper-2` / `bg-surface` | 紙感底色三階 |
| `text-ink` / `text-ink-soft` / `text-ink-mute` | 文字三階 |
| `bg-shu` / `text-shu` / `border-shu` | 朱紅品牌色 |
| `bg-shu-100` ~ `bg-shu-900` | 朱紅 50–950 完整色階 |
| `bg-day` / `bg-day-soft` / `text-day-deep` | 早班三色 |
| `bg-night` / `bg-night-soft` / `text-night-deep` | 晚班三色 |
| `border-rule` / `border-rule-2` | 髮絲線 |
| `font-serif` / `font-sans` / `font-mono` | 三種字型 |
| `tracking-stamp` | stamp label 字距 |
| `rounded-lg` / `rounded-md` / `rounded-pill` | 圓角（所有 2xl/3xl 都已被收斂回 lg） |
| `shadow-paper-1` / `shadow-paper-2` | 紙感極淺陰影 |

加 utility class shortcut：

| class | 用途 |
|---|---|
| `.serif` | 等於 `font-family: var(--font-serif); font-weight: 500;` |
| `.mono` | monospace + tabular nums |
| `.tnum` | tabular nums |
| `.stamp-label` | 12px mono + 0.18em 字距 + uppercase + ink-soft |
| `.hairline-t` / `.hairline-b` | 單側髮絲線 |

複雜元件 class（從 `components.css`）：

| class | 用途 |
|---|---|
| `.paper-grain` | 紙感顆粒 overlay（套在 body 容器） |
| `.shu-stamp` | 朱字章雙框 |
| `.kanji-mark` | 漢字小圖章 |
| `.date-stamp-frame` | 四角描邊的日期框 |
| `.agent-chip` | 探員 pill（用 inline `--agent-color` 帶色） |
| `.filter-chip` | 篩選 chip |
| `.agent-portrait-photo` | 圓頭像 + 探員色 ring |
| `.agent-profile-photo` | 方頭像 + 雙重 ring |
| `.stat-bar` + `.stat-bar__day/night` | 出勤 stacked bar |
| `.shift-icon-day` / `.shift-icon-night` | 班次小圖示底色 |
| `.empty-kanji` | EmptyState 大漢字圖章 |

---

## 🔍 Phase 0 完成標準 checklist

- [ ] `app/assets/css/main.css` 含 `@theme` 區塊
- [ ] `app/assets/css/components.css` 存在並被 `main.css` `@import`
- [ ] `app/app.config.ts` primary 改為 shu（或 'primary'，由 `@theme` 自動 alias）
- [ ] `app/layouts/default.vue` 移除 `bg-linear-to-br from-pink-50 via-purple-50 to-blue-50` 與 `dark:` 區段
- [ ] 全站 `rg "dark:"` 結果 = 0
- [ ] `pnpm dev` 成功啟動，無 build error
- [ ] 任一頁面加上前述測試卡片，能呈現紙感 + 朱紅按鈕
- [ ] Commit：`git commit -m "feat: design tokens + remove dead dark mode + paper-grain background"`
- [ ] Push：`git push -u origin refactor/uiux-redesign-phase-0-tokens`
- [ ] 開 PR：`gh pr create --base refactor/uiux-redesign --title "phase-0: design tokens + remove dead dark mode"` （⚠️ base 是 `refactor/uiux-redesign`，**不是 `main`**）

完成後即可進 Phase 1（重寫 AppHeader / AppFooter）。
