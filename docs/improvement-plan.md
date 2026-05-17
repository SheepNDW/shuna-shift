# 開發計畫 — Google Sheets 取數穩定性改善

> 建立日期：2026-05-18
> 目的：跨 session 追蹤班表取數流程的待改善事項與進度。
> 背景：目前 `request sheet` 採手動寫死範圍，表單更新時容易出現非預期的 parse 錯誤。

## 開發流程

- 每個 PR 都**開新分支**進行開發，完成後**發 PR 回 `main`**，不直接提交到 `main`。
- 每個 PR 章節都附**檢查清單**；開發過程逐項把 `- [ ]` 改成 `- [x]`，PR 章節所有項目勾完才算該階段完成。
- 完成某個 PR 後，更新「進度總覽」表格的狀態與 PR 連結。
- 全部 4 個 PR 完成後，**刪除本檔 `docs/improvement-plan.md`** —— 此計畫為過渡性追蹤文件，任務完成即不再保留。

## 進度總覽

| PR | 包含項目 | 主題 | 相依 | 狀態 |
|----|---------|------|------|------|
| —  | #0a / #0b | 防禦性解析、蜜柑 🍊 統計修正 | — | ✅ 已完成（`d5f5268`、`cd19644`）|
| PR 1 | #6 + #1 + #3 + #7 | 取數層重構（地基）| 無 | 🔍 待審查（[#13](https://github.com/SheepNDW/shuna-shift/pull/13)）|
| PR 2 | #2 | 歷史 sheet 名稱解耦 | PR 1 | ⬜ 待處理 |
| PR 3 | #4 | 班別解析改用 B 欄 | 無 | ⬜ 待處理 |
| PR 4 | #5 | AGENTS emoji 結構統一 | 無 | ⬜ 待處理 |

開發順序：`PR 1 → PR 2`（PR 2 相依 PR 1）；`PR 3`、`PR 4` 獨立，可任意順序或並行。

---

## PR 1 — 取數層重構（地基）

**分支**：`feat/sheets-client-refactor`（建議）　**相依**：無

把取數邏輯收斂成單一 client，順勢把開放式範圍、title 對應、dev 快取繞過一起做掉，避免日後重工。

### #6 抽共用 sheets client + schema 驗證（低優先，但作為地基先做）

- **問題**：`sheet.get.ts` 與 `statistics.get.ts` 重複 URL 組裝與 `res?.sheets...` 取值邏輯；無 schema 驗證，parse 失敗時不易定位是哪個 range／哪一列。
- **作法**：新增 `server/utils/sheets.ts`，提供 `fetchSheetRanges(ranges)` 回傳 `Map<sheetTitle, RowData[]>`；以 Zod 驗證回應結構，失敗時 log 出 range／列資訊。
- **影響檔案**：新增 `server/utils/sheets.ts`，重構 `server/api/sheet.get.ts`、`server/api/statistics.get.ts`。

### #1 改用開放式範圍 `A5:C`（高優先）

- **問題**：`每日班表!A5:C45`、`過去班表20260101~!A5:C743` 寫死結束列數，多排幾天或歷史累積就被截斷或讀到空列。
- **作法**：A1 notation 省略結束列，改為 `每日班表!A5:C`、`過去班表!A5:C`，API 只回傳有資料的列。
- **影響檔案**：`server/utils/sheets.ts`（於新 client 內實作）。

### #3 以 sheet title 對應資料，不靠陣列索引（高優先）

- **問題**：`res.sheets[0]` / `sheets[1]` 假設回傳順序固定，與 `ranges` 陣列順序耦合。
- **作法**：一併抓 `sheets.properties.title`，client 回傳以 sheet 名稱為 key 的 `Map`。
- **影響檔案**：`server/utils/sheets.ts`、`server/utils/transformer.ts`。

### #7 dev 環境快取繞過機制（低優先）

- **問題**：`defineCachedEventHandler` 長快取（sheet 3h、statistics 6h）在 dev 容易讓人誤判修正未生效。
- **作法**：dev 環境縮短 `maxAge`，或支援 `?nocache` 之類的繞過參數。
- **影響檔案**：`server/api/sheet.get.ts`、`server/api/statistics.get.ts`。

### 檢查清單

- [x] 從 `main` 開出開發分支
- [x] #6：新增 `server/utils/sheets.ts`，提供 `fetchSheetRanges(ranges)` 回傳 `Map<sheetTitle, RowData[]>`
- [x] #6：以 Zod 驗證 Sheets 回應結構，失敗時 log 出 range／列資訊
- [x] #1：range 改為開放式 `A5:C`
- [x] #3：抓 `sheets.properties.title`，以 title 對應資料取代 `sheets[0]`/`sheets[1]`
- [x] #7：dev 環境縮短 `maxAge` 或支援 `?nocache` 繞過參數（`server/utils/cache.ts` 的 `shouldBypassCache`）
- [x] `sheet.get.ts`、`statistics.get.ts` 改用共用 client
- [x] 新增/更新單元測試，`pnpm test` 通過（unit 98、nuxt 53）
- [x] `pnpm lint`、`pnpm typecheck` 通過
- [ ] **驗收**：表單新增/刪除列、調整 `ranges` 順序後，班表與統計仍正確（需實機）
- [ ] 發 PR 回 `main` 並 merge（PR [#13](https://github.com/SheepNDW/shuna-shift/pull/13) 已開，待審查 merge）
- [ ] 更新本檔「進度總覽」PR 1 狀態為 ✅ 並附 PR 連結

---

## PR 2 — 歷史 sheet 名稱解耦

**分支**：`feat/history-sheet-decoupling`（建議）　**相依**：PR 1

### #2 移除歷史 sheet 名稱的日期後綴（高優先）

- **問題**：歷史 sheet 名稱 `過去班表20260101~` 嵌入日期，換期改名後 API 直接 404。
- **作法**（擇一，由優到次）：
  1. 在 Google Sheet 定義具名範圍（Named Range）`歷史班表`、`當期班表`，程式以 `ranges=歷史班表` 引用，插入列自動延伸。
  2. 先以輕量 request 取 `fields=sheets.properties.title`，用前綴 `過去班表` 比對出實際 sheet 名再組資料 request。
  3. 請表單擁有者將歷史 sheet 改成固定名稱。
- **影響檔案**：`server/utils/sheets.ts`、`server/api/statistics.get.ts`。
- **外部相依**：方案 1、3 需配合 Google Sheet 設定，開發前須先決定方案。

### 檢查清單

- [ ] 從 `main` 開出開發分支（PR 1 已 merge）
- [ ] 決定採用方案（具名範圍 / 動態解析 title / 改固定名稱）
- [ ] 若需動 Google Sheet：完成具名範圍設定或 sheet 改名
- [ ] #2：實作對應的 sheet 解析邏輯，移除日期後綴硬編碼
- [ ] 新增/更新單元測試，`pnpm test` 通過
- [ ] `pnpm lint`、`pnpm typecheck` 通過
- [ ] **驗收**：歷史 sheet 換期/改名後程式無須調整
- [ ] 發 PR 回 `main` 並 merge
- [ ] 更新本檔「進度總覽」PR 2 狀態為 ✅ 並附 PR 連結

---

## PR 3 — 班別解析改用 B 欄

**分支**：`feat/shift-type-from-column-b`（建議）　**相依**：無

### #4 以 B 欄判斷早/晚班（中優先）

- **問題**：目前靠「A 欄空白即晚班」推斷（`mergeDayAndNightShifts`）。表單 B 欄已明寫「早/晚」，版面微調或某日僅有單班時推斷會出錯。
- **作法**：解析 B 欄（範圍 `A:C` 已含 B 欄，僅 `transformer` 未使用），以明確值判定班別。
- **影響檔案**：`server/utils/transformer.ts`、`server/utils/parser.ts`。

### 檢查清單

- [ ] 從 `main` 開出開發分支
- [ ] #4：`transformer` 改以 B 欄「早/晚」值判定班別
- [ ] 新增單元測試，含「僅晚班」「僅早班」邊界案例
- [ ] `pnpm test`、`pnpm lint`、`pnpm typecheck` 通過
- [ ] **驗收**：以 B 欄為準的測試案例全數通過
- [ ] 發 PR 回 `main` 並 merge
- [ ] 更新本檔「進度總覽」PR 3 狀態為 ✅ 並附 PR 連結

---

## PR 4 — AGENTS emoji 結構統一

**分支**：`refactor/agents-emoji-unification`（建議）　**相依**：無

### #5 統一 AGENTS 的 emoji 處理（中優先）

- **問題**：正職以 emoji 當 `AGENTS` 的 key，其他人以文字當 key，混用。新探員轉正職改用 emoji 時易漏接（🍊 蜜柑即一例，目前以 `NAME_ALIASES` 補救，根本結構未解）。
- **作法**：`AGENTS` 改為一律以正式名稱為 key，新增選填 `emoji` 欄位；由 `emoji` 欄位自動建立 emoji → 名稱查表，取代手動維護的別名。
- **影響檔案**：`shared/constant.ts`、`shared/types/index.ts`、`server/utils/parser.ts`、`server/utils/statistics.ts`、`app/components/AgentCard.vue`。

### 檢查清單

- [ ] 從 `main` 開出開發分支
- [ ] #5：`Agent` 型別新增選填 `emoji` 欄位
- [ ] #5：`AGENTS` 改為一律以正式名稱為 key，正職填入 `emoji`
- [ ] #5：由 `emoji` 欄位自動建立 emoji → 名稱查表，取代手動 `NAME_ALIASES` 中的 emoji 別名
- [ ] #5：更新 `parser`、`statistics`、`AgentCard` 的查找邏輯
- [ ] 更新/新增單元測試，`pnpm test` 通過
- [ ] `pnpm lint`、`pnpm typecheck` 通過
- [ ] **驗收**：emoji 與文字名稱皆能對應到同一探員
- [ ] 發 PR 回 `main` 並 merge
- [ ] 更新本檔「進度總覽」PR 4 狀態為 ✅ 並附 PR 連結

---

## 收尾

- [ ] PR 1～PR 4 全數 merge 完成
- [ ] 刪除本檔 `docs/improvement-plan.md`

## 待確認事項

- 最初的 SWR 500 錯誤已由 #0a 防禦性修正解決。若重啟後班表仍為空，代表 Google Sheets API 實際回傳結構異常，需另查環境變數與 API 權限。
