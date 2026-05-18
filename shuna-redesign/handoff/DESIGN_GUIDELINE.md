# 朱雫查班工具 — 設計系統規範 v2.0
> Paper Edition · 昭和喫茶店 × 朱雫
> Last updated: 2026-05-18

這份文件對應 `shuna-redesign/` 中的 prototype。目的是給開發者（人或 Claude Code）一份可直接拷貝為 CSS / token / Vue 元件的參考。

---

## 1. 設計哲學

> **重點**：移除全站漸層糖果，回到喫茶店的紙感氛圍。讓字級對比與留白建立層級，不再讓所有元素互相喊話。

三個原則：

1. **紙感為底，朱紅為點**　全站 1 個品牌色（朱），其他都是中性墨棕灰。漸層只在極少數情境出現（cards 內的微 overlay），不再用於文字、按鈕、邊框、pill。
2. **語義一致**　日班永遠 amber-honey，夜班永遠 indigo。Section heading 不再每頁換色。
3. **東方排版的呼吸感**　漢字圖章（朱／今／表／員／計）取代通用圖標。標題使用 serif（Noto Serif TC）建立檔案感，內文 sans 維持易讀，數字 monospace 強調 tabular。

---

## 2. 設計 Tokens

完整定義見 [`tokens.css`](../tokens.css)。以下列出所有需轉成 Tailwind v4 `@theme` 或 CSS 變數的 token。

### 2.1 色彩

| Token | OKLCH 值 | 用途 |
|---|---|---|
| `--color-paper` | `oklch(0.972 0.014 78)` | 頁面背景（紙感奶油） |
| `--color-paper-2` | `oklch(0.952 0.018 78)` | 次級背景條紋 |
| `--color-surface` | `oklch(0.985 0.010 78)` | 卡片表面 |
| `--color-rule` | `oklch(0.86 0.020 70)` | 主要髮絲線 |
| `--color-rule-2` | `oklch(0.91 0.018 75)` | 次級髮絲線 |
| `--color-ink` | `oklch(0.24 0.025 55)` | 主要文字（深墨棕） |
| `--color-ink-soft` | `oklch(0.40 0.022 60)` | 次要文字 |
| `--color-ink-mute` | `oklch(0.58 0.018 65)` | caption、metadata |

**品牌色 — 朱 (cinnabar / vermilion)**

| Token | 值 | 用途 |
|---|---|---|
| `--color-shu` | `oklch(0.55 0.165 32)` | primary accent、active state、CTA |
| `--color-shu-deep` | `oklch(0.43 0.150 30)` | hover、emphatic |
| `--color-shu-soft` | `oklch(0.93 0.038 35)` | 淺色 wash、tag 背景 |
| `--color-shu-line` | `oklch(0.78 0.090 32)` | tinted 髮絲線 |

**語義色 — 班次**

| Token | 值 | 用途 |
|---|---|---|
| `--color-day` | `oklch(0.70 0.115 70)` | 早班主色（蜂蜜琥珀） |
| `--color-day-soft` | `oklch(0.95 0.040 78)` | 早班背景 |
| `--color-day-deep` | `oklch(0.52 0.115 65)` | 早班文字 |
| `--color-night` | `oklch(0.42 0.080 255)` | 晚班主色（深靛藍） |
| `--color-night-soft` | `oklch(0.93 0.025 255)` | 晚班背景 |
| `--color-night-deep` | `oklch(0.32 0.080 260)` | 晚班文字 |

> **不再使用**：`pink-50`、`pink-500`、`purple-500`、`pink→purple` 漸層、`from-pink-50 via-purple-50 to-blue-50` 三色 body 漸層、`yellow-400→orange-400`、`indigo-500→purple-500`、`pink-500→purple-500` 任何漸層按鈕。

### 2.2 字型

```css
--font-serif: "Noto Serif TC", "Shippori Mincho", "Songti TC", serif;
--font-sans:  "Noto Sans TC", "Inter", -apple-system, "PingFang TC", sans-serif;
--font-mono:  "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
```

**字級階梯**

| Token | px | 用途 |
|---|---|---|
| `--fs-12` | 12 | caption / stamp label |
| `--fs-13` | 13 | small text |
| `--fs-14` | 14 | UI / button / nav |
| `--fs-15` | 15 | secondary body |
| `--fs-16` | 16 | base body |
| `--fs-18` | 18 | lead / large body |
| `--fs-22` | 22 | h4 / 區段標題 |
| `--fs-28` | 28 | h3 |
| `--fs-36` | 36 | h2 / numeric display |
| `--fs-48` | 48 | h1 (mobile) |
| `--fs-64` | 64 | hero / page title (desktop) |

**字型角色**

- **Serif** (`.serif`)：頁面標題、區段標題、探員名字、漢字圖章
- **Sans**：所有 UI 文字、內文、按鈕
- **Mono** (`.mono`)：日期數字、統計數字、stamp label、hex 色碼
- **Stamp label** (`.stamp-label`)：12px monospace + 0.18em letter-spacing + uppercase，用於小型分類標籤（e.g. `TODAY · 本日のシフト`）

### 2.3 間距

4-based 階梯：`--space-1`(4) `--space-2`(8) `--space-3`(12) `--space-4`(16) `--space-5`(20) `--space-6`(24) `--space-8`(32) `--space-10`(40) `--space-12`(48) `--space-16`(64) `--space-20`(80) `--space-24`(96)

### 2.4 圓角

| Token | 值 | 用途 |
|---|---|---|
| `--r-sm` | 4px | badge、small button |
| `--r-md` | 8px | button、input |
| `--r-lg` | 14px | card |
| `--r-pill` | 999px | chip、pill |

> 不再使用 `rounded-2xl`(16px) `rounded-3xl`(24px) — 圓角縮小一級，紙感更明顯。

### 2.5 陰影 & 邊框

陰影**極度克制**。卡片以髮絲線（`1px solid var(--color-rule)`）為主，懸停可加 `--shadow-2`。
- `--shadow-1`：`0 1px 0 0 rgb(60 40 20 / 0.04), 0 1px 2px rgb(60 40 20 / 0.05)`
- `--shadow-2`：`0 2px 1px -1px rgb(60 40 20 / 0.06), 0 6px 14px -8px rgb(60 40 20 / 0.10)`

不再使用 `shadow-lg`、`shadow-2xl`、`shadow-xl` 等 Tailwind 預設陰影。

---

## 3. 元件目錄

每個元件對應 prototype `components.jsx` / `pages.jsx`，在 Vue 中應抽成單檔 SFC。

### 3.1 `PageHeader`（**必抽**）

> 取代目前每頁手刻的「小 pill + 漸層大標 + 副標」三件組。

```vue
<PageHeader
  kanji="表"
  label="SHIFT TIMETABLE · 班表"
  title="完整班表"
  subtitle="14 日 · 05/15 – 05/28"
  meta="14 / 14 日"
/>
```

組成：漢字圖章（`.kanji-mark`，朱紅描邊）+ stamp-label + 髮絲線延伸 + 右側 meta + serif 大標 + sub。

### 3.2 `AgentChip`

排班列表中代表探員的 pill。包含 `:dot` 代表色 + 名字 + emoji。Hover 邊框變探員色，`is-highlighted` 加底色 wash。

### 3.3 `AgentPortrait`

圓形頭像 + 探員色 ring + 名字（home 早晚班用）。

### 3.4 `AgentCard`

agents 列表使用的橫向卡片：4:3 照片 + 名字 + 代表色 hex + bio + IG handle。Hover 上抬 + 邊框變探員色。

### 3.5 `DailyCard`

`shifts` 頁的單日卡：左側 DateTag、右側上下排 ShiftRow。`is-today` 加左側朱紅實線 + 邊框朱紅。

### 3.6 `DateTag`

`月/日`（大號 mono）+ 星期（serif）+ `TODAY` badge（朱紅，僅當日）+ 自訂描述。

### 3.7 `ShiftMark` / `ShiftRow`

班次 label。左側圓形圖示（早 = sun，晚 = moon）+ 名稱 + 數量（`--day-deep` / `--night-deep` 文字色）。

### 3.8 `EmptyState`

統一 empty state：大漢字圖章（如「無」「休」「空」）+ serif 標題 + 副標 + 可選 action。取代現有 5 種不一致的 empty state。

### 3.9 `BrandMark`

`朱` 字章，用於 Header 與 Footer。可調 size。

### 3.10 `AppHeader` / `AppFooter`

固定 nav：4 個 kanji icon + label + active state 用 `--color-shu-soft` 加底。CTA「預約」按鈕在右側（深墨）。

---

## 4. Do's & Don'ts

### ✅ Do

- 用 **髮絲線** 分隔 sections，不用陰影
- 用 **字級對比** 建立層級，不用顏色對比
- 數字一律 `.mono.tnum`（tabular-nums）
- 漢字圖章在 section heading 與圖示位置
- 探員代表色出現在 `--agent-color` CSS var，讓 chip / card / dot 用同一個變數
- 早班 = day token，晚班 = night token；統計頁 / 列表 / 詳情頁三處顏色一致

### ❌ Don't

- 不要用 `bg-clip-text text-transparent` 漸層文字
- 不要用 `p-1 bg-linear-to-r ... rounded-2xl` 雙層包按鈕
- 不要在非互動元素加 `hover:scale-105`（誤導性）
- 不要每頁換 section heading 配色（過去是 purple / pink / blue / emerald 各一頁）
- 不要混用 `rounded-2xl` 與 `rounded-3xl`，遵守 `--r-lg` (14px)
- 不要再寫 `dark:` class（dark mode 已死碼，正式廢除）

---

## 5. 圖示與裝飾

- **班次圖示**：用 prototype 中的 `SunGlyph` / `MoonGlyph` inline SVG，stroke 1.5、`currentColor`，不要用 `i-heroicons-sun-solid`（太重）。
- **漢字裝飾**：`今 / 表 / 員 / 計 / 朱 / 休 / 空 / 無 / 正 / 現 / 日 / 夜 / 總 / 冠 / 色` — 大量使用，傳達喫茶店感。
- **不要**手刻 SVG 插畫（容易變 AI slop）。
- **不要**用 emoji 當 UI 元素 — 唯一例外是探員自己的 emoji（如 🐷 🥨 🌙 🍊），那是 brand identity 的一部分。

---

## 6. 響應式斷點

- `≤ 920px`：nav 收為 kanji-only、hero 改單欄、daily card 改單欄、profile 改單欄、summary tiles 改 2 欄
- `≤ 520px`：summary tiles / agents grid 改單欄

不需要更多 breakpoint。

---

## 7. 無障礙

- `:focus-visible` 一律使用 `2px solid var(--color-shu)` 外框 + 2px offset
- 探員代表色不可作為**唯一**語義 — 必須伴隨名字文字
- 對比度：`--color-ink` 對 `--color-paper` ≈ 12:1（AAA），其他組合皆 ≥ 4.5:1
- 班次圖示有 SVG `aria-hidden`，文字「早班」「晚班」永遠存在
- `:where(button, a, input, [role="button"]):focus-visible` 已全域設定，請勿覆寫

---

## 8. 與現有 @nuxt/ui 的關係

| @nuxt/ui 元件 | 處置 |
|---|---|
| `UContainer` | 保留，但 max-width 改為 1180px（`--container`） |
| `UButton` | **改寫**為 `.btn` / `.btn.ghost` / `.btn.shu` 三變體；或保留 UButton 但用 `app.config.ts` 設成 neutral + 移除所有 color="primary" 漸層包裝 |
| `UBadge` | 保留，但統一只用 `.pill` 樣式 |
| `UIcon` | 保留 heroicons，但只用 outline 變體（24×24，stroke 1.5）；班次圖示改 inline SVG |
| `colorMode` | **設為 `false` 並全砍 `dark:` class**（已是死碼） |

`app.config.ts` 建議：
```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'shu',     // 自訂 palette key
      neutral: 'stone',
    },
  },
});
```

---

## 9. Tweaks（可選功能）

prototype 提供四種色系切換（朱／抹茶／墨／柚）— 正式上線只啟用「朱」。
其他三種僅作為**節慶／活動限定**或 A/B 測試備用：
- `data-palette="matcha"` 適合春季 / 抹茶限定企劃
- `data-palette="yuzu"` 適合柚子季
- `data-palette="sumi"` 適合店休公告／嚴肅內容
