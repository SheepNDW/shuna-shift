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
pnpm test:e2e          # Playwright e2e（測的是 build 產物，要先 pnpm build）
```

執行單一測試檔：
```bash
pnpm vitest run server/utils/test/parser.spec.ts
pnpm vitest run --project=nuxt app/components/test/nuxt/ShiftCard.spec.ts
pnpm exec playwright test test/e2e/cache-control.spec.ts
```

e2e 第一次跑之前要裝瀏覽器：`pnpm exec playwright install chromium`。

## 環境變數

`.env` 需設定（對應 `nuxt.config.ts` 的 `runtimeConfig`）：
```
NUXT_GSHEETS_KEY=       # Google Sheets API Key
NUXT_SPREADSHEET_ID=    # Google Spreadsheet ID
NUXT_PUBLIC_SITE_URL=   # 選填。canonical / og:url 的站台網址，未設時用 nuxt.config 的預設值
NUXT_SHEETS_API_BASE=   # 只給 e2e 用，正式環境不要設。Sheets API 的位址，未設時打 Google
```

`NUXT_SHEETS_API_BASE` 由 `playwright.config.ts` 設給 build 出來的 server，指向本機的假 Sheets server。API key 會跟著請求送到這個位址，所以 `.env` 與 Vercel 都不該有它；`server/utils/test/sheets.spec.ts` 釘住「沒設時一定打 Google」。

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

新增探員：在 `shared/constant.ts` 的 `AGENTS` Map 新增一筆，同時更新 `NAME_ALIASES`（若有別名）。`fileNo` 取目前最大值 +1，不要重用離開者的號碼 —— 那個欄位在探員頁被呈現成「AGENT FILE · No. XXX」，是身分的一部分，不該因為別人加入或離開而位移（`shared/test/constant.spec.ts` 會擋重複值）。

### API 快取

兩支 API 均使用 `server/utils/cache.ts` 的 `defineCdnCachedEventHandler`（包住 nitro 的 `defineCachedEventHandler`）：
- `/api/sheet` → 快取 3 小時
- `/api/statistics` → 快取 6 小時

之所以要包一層：直接把 opts 傳給 `defineCachedEventHandler` 時 `swr` 預設值不會生效，nitro 會吐出瀏覽器專用的 `max-age`，而 Vercel edge 對 function 回應只認 `s-maxage` → CDN 完全不會建立快取。wrapper 顯式給 `swr` / `staleMaxAge`，讓回應帶 `s-maxage=<maxAge>, stale-while-revalidate=60`（詳細推導見該檔註解）。這是 nitro 交給 Vercel 的 header；只設 `Cache-Control` 時，Vercel 的 proxy 會把 `s-maxage` 與 `stale-while-revalidate` 消化掉，瀏覽器或 `curl` 看到的是 `public, max-age=0, must-revalidate`，看起來像沒設快取。要確認 CDN 有沒有接手，看連打兩次的第二次 `x-vercel-cache` 是不是 `HIT`，不要看 `cache-control`。

代價是**回應不再帶 `max-age`，瀏覽器端不快取** —— nitro 的 header 分支互斥，開了 `swr` 就拿不到 `max-age`。client-side 換頁時會真的發請求，但會終止在 edge 而非 origin。

因為這套推論建立在 nitropack 的**內部實作**上，`pnpm-workspace.yaml` 的 `overrides` 把 nitropack 釘在 exact `2.13.6`：升版必須是明確動作，不能被一次 `pnpm update` 無聲帶走。要升版時連同 `server/utils/test/cache-header.spec.ts` 一起看 —— 那支 canary 會把 nitro 組 cache-control 的原始碼原文抽出來實際跑一次，nitro 改寫那段時會轉紅並指出該確認什麼。（#44）

**升 `nuxt` 本身也要回頭確認這個 pin。** pnpm 的 override 無條件覆寫整棵樹，不檢查是否滿足任何 dependent 宣告的 semver range。**這條在 #39 的升級批次實際踩到了**：`nuxt` 4.4.2 → 4.5.2 讓 `@nuxt/nitro-server` 改宣告 `nitropack@^2.13.4`，但 override 仍是 2.13.3 —— 整棵樹被靜默壓在不滿足宣告的版本上，而 `pnpm install` 依然 exit 0、零警告。canary 對這種情況也無感：它讀的是安裝後的 `cache.mjs`，那個檔案根本沒變。

這條現在由 `server/utils/test/dependency-pins.spec.ts` 擋：override 不滿足 `@nuxt/nitro-server` 宣告的 range、或 `node_modules` 裝的版本與 override 不同，`pnpm test:unit` 就紅，訊息會指回這一節。想手動看目前的值（兩者都是 transitive dependency、沒有 hoist 到根 `node_modules`，所以從 `nuxt` 沿依賴鏈一層層解析，見〈依賴版本策略〉的〈pnpm 設定〉）：

```bash
node -e "
const { createRequire } = require('node:module');
const { realpathSync } = require('node:fs');
const { join } = require('node:path');
const walk = (...names) => names.reduce(
  (from, name) => realpathSync(createRequire(from).resolve(name + '/package.json')),
  join(process.cwd(), 'package.json'),
);
const range = require(walk('nuxt', '@nuxt/nitro-server')).dependencies.nitropack;
const actual = require(walk('nuxt', '@nuxt/nitro-server', 'nitropack')).version;
console.log(range, actual, require('semver').satisfies(actual, range));
"
```

不滿足時把 override 提到滿足的最低版本，然後**跑一次 canary**，那才是升 pin 唯一的驗證。（2.13.3 → 2.13.4 實測 `cache.mjs` 位元組完全相同，canary 綠燈。2.13.4 → 2.13.6 則真的改了：那段開頭多了一道 `isCacheableResponse` 門，回應帶 `set-cookie`、`cache-control` 含 `private`／`no-store`／`no-cache`、或 `vary` 列了非預期 header 時整段跳過（條件以 `cache.mjs` 的 `isCacheableResponse` 為準）；`s-maxage` 分支本身一字未動。canary 以 stub 補上那個 helper 並多釘一條「門存在」的測試，細節見該檔註解。）

`?nocache` 走 wrapper 的繞過分支：直接呼叫原 handler 並標 `cache-control: no-store`，避免繞過的回應被 CDN 用自己的 cache key 存起來。dev 環境（`import.meta.dev`）一律繞過。

前端另有一層 client-side 快取，兩支 API 的策略不同（皆在 `app/utils/cache.ts`）：

- 統計走 `makeTtlCache`，2 小時新鮮度上限（比對回應的 `metadata.lastUpdated`）。
- 班表走 `reusePayloadData`，不設時效，只保證「同一次 SSR / 同一個 session 內只抓一次」。

班表非得自己寫 `getCachedData` 不可：Nuxt 預設的那支在 server 端只讀 `nuxtApp.static.data`（SSR 當下是空的），於是同一次 SSR 裡 layout 的 footer 與頁面會各打一次 `/api/sheet`，光靠共用 asyncData key 擋不住。

### API 錯誤處理

**錯誤訊息含 API key —— log 與回應兩側都要遮。** ofetch 的 `FetchError` 會把整個請求 URL 塞進 `message`，其中含 `key=<NUXT_GSHEETS_KEY>`。兩條路徑都會把它送出去，且都不會有任何警示：

- **log 側** —— `console.error(msg, error)` 直接把 key 印進 Vercel runtime log。改用 `server/utils/log.ts` 的 `formatErrorForLog(error)`：保留 stack 與其餘 query 參數，只把 key 的值換成 `[REDACTED]`。
- **回應側** —— `createError({ statusMessage: error.message })` 會讓 nitro 把它同時寫進 JSON body 的 `statusMessage` / `message` 與 HTTP status line 的 reason phrase。這兩支是公開端點，上游只要正在故障（key 過期／配額用盡／Google 5xx），任何人打一下就拿得到 key。`statusMessage` 一律給固定字串，診斷資訊走 log。

固定字串要是 **ASCII**：h3 送出前會過 `sanitizeStatusMessage`（`DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g`），一整句中文會被刪成空字串，status line 於是退回 Node 預設的 `Internal Server Error`，「是哪一支掛了」的訊號就沒了，還會每次多印一行 h3 警告。（body 那側的中文其實正常，不是亂碼 —— 這點實測過。）

`server/api/test/error-response.spec.ts` 對兩支既有 handler 把上述兩件事都釘住了。**新增 API handler 時兩側都要照做，並把它加進那支測試的 `describe.each`。**（#39）

## 依賴版本策略

`dependencies` / `devDependencies` **一律 caret**。可重現性來自 committed 的 `pnpm-lock.yaml` 加上 CI 的 `pnpm install --frozen-lockfile`，而不是 package.json 裡的範圍字串；把範圍寫死只會讓每個 patch 版都要開一次 PR，換不到額外保證。（`@nuxt/ui` / `@nuxt/image` / `@nuxt/test-utils` / `@nuxt/eslint` 一度是精確版本，查 git 歷史確認那是 `nuxi module add` 的預設行為而非刻意鎖版，已於 #39 統一。）

刻意鎖死的有三處。一是 **`pnpm-workspace.yaml` 的 `overrides.nitropack`**，理由見上面的〈API 快取〉。之所以用 override 而非在 `dependencies` 補一筆：nitropack 是 transitive dependency，寫在 `dependencies` 只約束得了我們自己那一條邊，樹裡其他 dependent 仍可能各自解析出別的版本；override 才是覆蓋整棵樹的那個機制。

二是 **`engines.node` 的 `24.x`**（而非 `>=24`）。Vercel 把這個欄位解析成「允許的最高 major」：Node 26 在 Vercel 上線後，`>=24` 會讓下一次部署無聲地跳到 26，而 `.nvmrc`（CI 也讀它）還停在 24，三個環境就此分岔。要換 Node major 時 `.nvmrc` 與 `engines.node` 一起改；patch 版只需改 `.nvmrc`，Vercel 在 major 內會自動套 patch。同一支 `dependency-pins.spec.ts` 也擋這條：`.nvmrc` 要落在 `engines.node` 範圍內，且 `engines.node` 只能含一個 major。

三是 **`package.json` 的 `packageManager`**（pnpm 的 exact 版本）。本機（corepack）、CI（`pnpm/action-setup` 讀這個欄位）、Vercel 都從這裡拿 pnpm 版本，這是三邊唯一的來源；corepack 不接受範圍，所以只能是 exact。升 pnpm 就是改這一行，再照下面的升級批次做法重裝。

Vercel 專案設定要有 **`ENABLE_EXPERIMENTAL_COREPACK=1`**（Production 與 Preview 都要勾）才會照這個欄位走。拿掉那個變數，Vercel 會改依 `lockfileVersion` 挑 pnpm 10，而 pnpm 10 讀不懂 `pnpm-workspace.yaml` 的 overrides，frozen install 直接失敗、正式站部署跟著壞。同理，pnpm 10 與 12 無法共用同一份帶 overrides 的 lockfile —— 換 pnpm major 時本機、CI、Vercel 必須同時換。

升級批次的做法：改完 `package.json` 後把 `node_modules` 與 `pnpm-lock.yaml` 一起清掉重裝，再 `pnpm audit --prod` 確認。沿用舊 lockfile 跑 `pnpm update`，或只刪 lockfile 但留 `node_modules`（pnpm 會拿 `node_modules/.pnpm/lock.yaml` 當解析偏好），都實際把 `@tiptap/core` 留在有漏洞的 3.22.4 而且零警告。

新增刻意鎖版時，把理由寫在這裡 —— 一個沒有理由的 exact 版本，日後沒人敢動也沒人知道能不能動。

### 暫不升的 major

`pnpm outdated` 會一直列出下面三組。它們不是漏掉，是上游還沒準備好。caret 範圍本來就不跨 major，所以不需要額外鎖版；每次升級批次照「解除條件」回頭查一次，成立就升，一組一個 PR。（以下為 2026-11-11 實測）

- **`typescript` 留在 6.x**（最新 7.0.2）。TS 7 是原生移植版，套件的 `exports` 只剩版本資訊與 `./unstable/*`，原本的 JS compiler API 不在了。實際裝起來有兩處直接掛：
  - `pnpm typecheck` —— `vue-tsc` 3.3.14 啟動時 `require.resolve('typescript/lib/tsc')`，吐 `ERR_PACKAGE_PATH_NOT_EXPORTED`。
  - `pnpm lint` —— `typescript-eslint` 8.72.2 載入時直接丟 `typescript-eslint does not support TS 7.0`。

  不要拿 `vue-tsc` 自己宣告的 peer（`typescript: >=5.0.0`）判斷，那個範圍寬到沒有參考價值。解除條件：裝上 TS 7 後 `pnpm peers check` 不再列出 `typescript`（目前列的是 `@volar/typescript` 的 `<7` 與 `@typescript-eslint/*` 的 `>=4.8.4 <6.1.0`），且 `pnpm typecheck`、`pnpm lint` 都過。

- **`@vueuse/core`、`@vueuse/nuxt` 留在 14.x**（最新 15.0.0）、**`@nuxt/fonts` 留在 0.14.x**（最新 1.2.0）。兩組都卡在 `@nuxt/ui`：4.12.0 的 `dependencies` 是 `@vueuse/core: ^14.4.0`（連同 `@vueuse/shared`、`@vueuse/integrations`）與 `@nuxt/fonts: ^0.14.0`，而且它把 `@nuxt/fonts` 宣告成自己的 module dependency。專案這邊單獨升，`@nuxt/ui` 仍會帶著自己那份舊 major，同一套東西在 app 裡就有兩個 major。解除條件：下面印出的範圍接受新 major。

  ```bash
  npm view @nuxt/ui dependencies --json | grep -E 'vueuse|nuxt/fonts'
  ```

  `@vueuse` 那側專案只用到 `useWindowScroll` 與 `usePreferredReducedMotion`（靠 `@vueuse/nuxt` auto-import），解除後升級的風險很小。不要用 `overrides` 逼 `@nuxt/ui` 吃新 major —— 那等於替它宣稱相容。

### pnpm 設定

pnpm 11 起專案設定只從 `pnpm-workspace.yaml` 讀：`package.json` 的 `pnpm` 欄位整個被忽略，`.npmrc` 的 hoist 類設定也不再生效，兩者都只印一行 WARN、`install` 照樣 exit 0。override 寫回 `package.json` 就會悄悄失效，非 frozen 的 install 還會順手把 lockfile 裡的 override 刪掉 —— `dependency-pins.spec.ts` 擋這條：`package.json` 出現 `pnpm` 欄位就紅。（#55）

- **不 hoist。** 根 `node_modules` 只有直接依賴。需要摸 transitive dependency 的地方（nitropack canary、`dependency-pins.spec.ts`、unit 測試 import 的 `h3`）一律沿 app 實際的依賴鏈解析（`server/utils/test/resolve-along-chain.ts`；`h3` 在 `vitest.config.ts` 用同一支 helper 設 alias，比照 Nuxt 產生的 tsconfig paths），讀到的就是 app 執行時用的那一份。不要為了讓某個 import 過關而加 hoist 或補一筆 dependency：前者讓測試摸到「剛好被攤平」的那一份，後者讓版本與 nitro 實際用的分岔，兩種都會讓測試在錯的版本上變綠。
- **`allowBuilds` 預設 false。** 只有「不跑 build script 就會壞」的套件才設 true，理由寫在 `pnpm-workspace.yaml` 該項旁邊。新進來的套件帶 build script 時，install 會以 `ERR_PNPM_IGNORED_BUILDS` 失敗：先查它的 script 在做什麼，再決定 true 或 false。
- **`minimumReleaseAge: 1440`（24 小時）。** 發布未滿 24 小時的版本不解析；frozen install 也會逐筆檢查 lockfile，CI 與 Vercel 同樣受保護。pnpm 預設本來就是 1440，刻意寫出來是為了讓 `minimumReleaseAgeStrict` 變成 true：範圍內有夠舊的版本時退回那一版，找不到時 install 直接失敗，而不是悄悄裝進太新的版本（strict 為 false 時就會這樣裝）。`dependency-pins.spec.ts` 擋這條：這行被刪掉、值低於 1440、或有人寫了 `minimumReleaseAgeStrict: false`，都會紅。
  - **急件 patch**（例如當天發布的安全修正）：把錯誤訊息列出的 `套件@版本` 加進 `minimumReleaseAgeExclude`，跟 patch 放在同一個 PR，讓 diff 看得到這次為了誰破例。要寫到版本（`pkg@1.2.3`）—— 只寫套件名等於對那個套件永久關掉保護。下一次升級批次時，把已經滿 24 小時的項目清掉。

## 測試檔案位置

測試檔案與原始碼並置在 `test/` 子目錄：

| 類型 | 路徑規則 | 執行環境 |
|------|---------|---------|
| unit | `server/**/test/**/*.spec.ts` | node |
| unit | `shared/**/test/**/*.spec.ts` | node |
| unit | `app/**/test/unit/**/*.spec.ts` | node |
| nuxt | `app/**/test/nuxt/**/*.spec.ts` | nuxt |
| e2e | `test/e2e/**/*.spec.ts` | Playwright（chromium），對 `pnpm build` 的產物 |

e2e 不走 vitest。`playwright.config.ts` 會起兩個 process：`test/e2e/fake-sheets/server.ts`（假的 Google Sheets）與 `.output/server/index.mjs`（帶假 key，Sheets 位址指向前者），所以兩支 API 跑的都是正式程式碼，也不需要真的憑證。假資料依「台北的今天」動態產生（`test/e2e/fake-sheets/data.ts`）；它的形狀由 `server/utils/test/fake-sheets-contract.spec.ts` 拿正式的 parser 驗，改假資料時先跑那一支，比 build 完再開瀏覽器快得多。

e2e 不會自己 build：CI 沿用 Build 步驟的產物，本機改完程式要先 `pnpm build`，否則測到的是舊的。它也不在 husky 的 pre-commit 裡。

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

已安裝的 `everything-claude-code` plugin：

| Skill | 何時用 |
|---|---|
| `/ecc:vue-review`（或 `ecc:vue-reviewer` agent） | 改完 `.vue` 或 composable 後的 review |
| `ecc:nuxt4-patterns` | 與內附的 `nuxt` 重疊，需要第二種角度時再拉 |

原本這裡列的是 `vue-skills-bundle` 的 `/vue-best-practices` 等 skill。2026-08-15 查證該 bundle 已不存在於任何已註冊的 marketplace（三個 marketplace 共 521 個 plugin，無 vue 相關項目）；其中兩支的實際上游是 `vuejs-ai/skills`，已透過 antfu/skills 內附回來。仍沒有對應的是「Vue Router」「響應性 debug」與 `create-adaptable-composable` 三塊 —— 評估過但沒收的清單與理由見 `.claude/skills/README.md`。

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

Single-context 佈局 —— 根目錄 `GLOSSARY.md` + `docs/adr/`（皆為 lazy 建立，目前尚未存在）。詳見 `docs/agents/domain.md`。
