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
| PR 1 | #6 + #1 + #3 + #7 | 取數層重構（地基）| 無 | ✅ 已完成（[#13](https://github.com/SheepNDW/shuna-shift/pull/13)，squash `586651c`）|
| PR 2 | #2 | 歷史 sheet 名稱解耦 | PR 1 | ✅ 已完成（[#14](https://github.com/SheepNDW/shuna-shift/pull/14)，squash `f0ea16f`）|
| PR 3 | #4 | 班別解析改用 B 欄 | 無 | ✅ 已完成（[#15](https://github.com/SheepNDW/shuna-shift/pull/15)，squash `b8eaf94`）|
| PR 4 | #5 | AGENTS emoji 結構統一 | 無 | 🔍 待審查（[#16](https://github.com/SheepNDW/shuna-shift/pull/16)）|

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
- **附帶處理**：表單會把未來日期格預先以純白底填好待排班，開放式範圍會一併讀到（實測 76 筆中 62 筆）。transformer 新增 `isUnscheduledSchedule`，過濾「兩班皆空 + 無 description + 純白底 `#ffffff`」的列；店休日（灰底 `#999999`）與節日（帶 description）保留。
- **前提與風險**：此判定依賴「表單顯式為未來日期列填白底」這個慣例。若某未來列未套任何底色（`backgroundColor` 解析為 `''`），不會被過濾而會洩漏到前端。日後可於 PR 3 以 B 欄「早/晚」訊號交叉判定，降低對底色慣例的耦合。
- **影響檔案**：`server/utils/sheets.ts`（於新 client 內實作）、`server/utils/transformer.ts`。

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
- [x] #1：transformer 過濾尚未排班的未來空白日期（純白底、兩班空白、無 description）
- [x] #3：抓 `sheets.properties.title`，以 title 對應資料取代 `sheets[0]`/`sheets[1]`
- [x] #7：dev 環境縮短 `maxAge` 或支援 `?nocache` 繞過參數（`server/utils/cache.ts` 的 `shouldBypassCache`）
- [x] `sheet.get.ts`、`statistics.get.ts` 改用共用 client
- [x] 新增/更新單元測試，`pnpm test` 通過（unit 104、nuxt 53）
- [x] `pnpm lint`、`pnpm typecheck` 通過
- [x] **驗收**：實機 smoke test —— `/api/sheet` 回 14 筆（過濾 62 筆未排班空列）、`/api/statistics` 日期範圍正確（`3月3日~5月31日`）；`ranges` 順序無關性由單元測試 `sheets.spec.ts` 涵蓋
- [x] 發 PR 回 `main` 並 merge（PR [#13](https://github.com/SheepNDW/shuna-shift/pull/13)，squash merge 為 `586651c`）
- [x] 更新本檔「進度總覽」PR 1 狀態為 ✅ 並附 PR 連結

---

## PR 2 — 歷史 sheet 名稱解耦

**分支**：`feat/history-sheet-decoupling`（建議）　**相依**：PR 1

### #2 移除歷史 sheet 名稱的日期後綴（高優先）

- **問題**：歷史 sheet 名稱 `過去班表20260101~` 嵌入日期，換期改名後 API 直接 404。
- **採用方案：方案 2（動態解析 title）**。方案 1（具名範圍）、方案 3（改固定名稱）皆需第三方試算表擁有者配合，無法由程式端獨立完成，故排除。
- **作法**：`statistics.get.ts` 先呼叫 `fetchSheetTitles()`（輕量 `fields=sheets.properties.title` request）取得所有 sheet 名稱，再以 `resolveSheetTitle()` 用前綴 `過去班表` 解析出實際名稱，組出資料 range。
- **多 sheet 處理**：實測試算表有 3 個 `過去班表*` sheet（使用中 1 個 + 已封存 2 個），「多個相符」為常態。使用中的 sheet 以 `~` 結尾（持續累積），封存後補上結束日 —— `resolveSheetTitle` 據此鎖定唯一以 `~` 結尾者，無法唯一判定才退回字典序最大並警告。
- **影響檔案**：`server/utils/sheets.ts`、`server/api/statistics.get.ts`。

### 檢查清單

- [x] 從 `main` 開出開發分支（PR 1 已 merge）
- [x] 決定採用方案：方案 2（動態解析 title）
- [x] #2：`sheets.ts` 新增 `fetchSheetTitles` / `parseSheetTitles` / `resolveSheetTitle`，`statistics.get.ts` 改用動態解析，移除日期後綴硬編碼
- [x] 新增/更新單元測試，`pnpm test` 通過（unit 114、nuxt 53；含審查後補強）
- [x] `pnpm lint`、`pnpm typecheck` 通過
- [x] **驗收**：實機 smoke test —— `/api/statistics` 動態解析到 `過去班表20260101~`，數據與 PR 1 一致（`3月3日~5月31日`、29 探員），dev log 無多 sheet 警告
- [x] 發 PR 回 `main` 並 merge（PR [#14](https://github.com/SheepNDW/shuna-shift/pull/14)，squash merge 為 `f0ea16f`；審查 `resolveSheetTitle` 改為 fail closed）
- [x] 更新本檔「進度總覽」PR 2 狀態為 ✅ 並附 PR 連結

---

## PR 3 — 班別解析改用 B 欄

**分支**：`feat/shift-type-from-column-b`（建議）　**相依**：無

### #4 以 B 欄判斷早/晚班（中優先）

- **問題**：目前靠「A 欄空白即晚班」推斷（`mergeDayAndNightShifts`）。表單 B 欄已明寫「早/晚」，版面微調或某日僅有單班時推斷會出錯。
- **作法**：`parser.ts` 新增 `parseShiftType`（解析 B 欄「早/晚」）；`transformRowToParsedData` 多讀 B 欄填入 `ParsedRow.shiftType`；`mergeDayAndNightShifts` 以 `shiftType` 判定班別，B 欄缺漏時退回原位置推斷（有日期＝早、無日期＝晚），避免無 B 欄資料時迴歸。
- **影響檔案**：`server/utils/transformer.ts`、`server/utils/parser.ts`。

### 檢查清單

- [x] 從 `main` 開出開發分支
- [x] #4：`transformer` 改以 B 欄「早/晚」值判定班別（B 欄缺漏退回位置推斷）
- [x] 新增單元測試：`parseShiftType` 4 項、「僅晚班」「僅早班」「B 欄缺漏退回推斷」邊界案例
- [x] `pnpm test`、`pnpm lint`、`pnpm typecheck` 通過（unit 122、nuxt 53）
- [x] **驗收**：實機 smoke test —— `/api/sheet` 14 筆、`/api/statistics` 與 PR 2 一致（`3月3日~5月31日`、29 探員）；既有 `expectedScheduleData` fixture 原樣通過，佐證正常 2 列日行為保留
- [x] 發 PR 回 `main` 並 merge（PR [#15](https://github.com/SheepNDW/shuna-shift/pull/15)，squash merge 為 `b8eaf94`；審查後補 A1 覆寫警告、A2 JSDoc、A3 次序顛倒測試）
- [x] 更新本檔「進度總覽」PR 3 狀態為 ✅ 並附 PR 連結

---

## PR 4 — AGENTS emoji 結構統一

**分支**：`refactor/agents-emoji-unification`（建議）　**相依**：無

### #5 統一 AGENTS 的 emoji 處理（中優先）

- **問題**：正職以 emoji 當 `AGENTS` 的 key，其他人以文字當 key，混用。新探員轉正職改用 emoji 時易漏接（🍊 蜜柑即一例，目前以 `NAME_ALIASES` 補救，根本結構未解）。
- **作法**：`AGENTS` 改為一律以正式名稱為 key，新增選填 `emoji` 欄位；由 `emoji` 欄位自動建立 `EMOJI_TO_NAME` 查表，取代手動維護的 emoji 別名。`normalizeAgentName` 改用此查表；`findAgentByName` 改為先 `normalizeAgentName` 再查表。
- **影響檔案**：`shared/constant.ts`、`shared/types/index.ts`、`server/utils/statistics.ts`。
- **附帶**：`parseAgents`（parser.ts）僅呼叫 `normalizeAgentName`，無須改動；`AgentCard.vue`、`ScheduleFilter.vue`、`useAgent.ts` 因 key 改名稱後與正規化後的班表資料一致，亦無須改動。正規化後的班表資料由 emoji 變為正式名稱，連帶更新相關 fixtures 與測試。

### 檢查清單

- [x] 從 `main` 開出開發分支
- [x] #5：`Agent` 型別新增選填 `emoji` 欄位
- [x] #5：`AGENTS` 改為一律以正式名稱為 key，正職（泠泠／米捲／Luna／蜜柑）填入 `emoji`
- [x] #5：新增 `EMOJI_TO_NAME` 由 `emoji` 欄位自動建表，取代 `NAME_ALIASES` 中的 `🍊` 別名
- [x] #5：`normalizeAgentName` 改用 emoji 查表；`findAgentByName` 改為正規化後查表
- [x] 更新/新增單元測試，`pnpm test` 通過（unit 125、nuxt 53；含新增 emoji → 名稱測試、fixtures 同步）
- [x] `pnpm lint`、`pnpm typecheck` 通過
- [x] **驗收**：emoji 與文字名稱皆能對應到同一探員（`findAgentByName('🐷')` 與 `('泠泠')` 同得 `rin`；實機 `/api/sheet` 探員名稱解析為正式名稱、`/api/statistics` 29 探員不變）
- [ ] 發 PR 回 `main` 並 merge
- [ ] 更新本檔「進度總覽」PR 4 狀態為 ✅ 並附 PR 連結

---

## 收尾

- [ ] PR 1～PR 4 全數 merge 完成
- [ ] 刪除本檔 `docs/improvement-plan.md`

## 待確認事項

- 最初的 SWR 500 錯誤已由 #0a 防禦性修正解決。若重啟後班表仍為空，代表 Google Sheets API 實際回傳結構異常，需另查環境變數與 API 權限。
