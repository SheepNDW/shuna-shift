import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';
import type { ConfigOptions } from '@nuxt/test-utils/playwright';

/**
 * e2e 測的是 `pnpm build` 的產物，不是 dev server：dev 環境一律繞過 API 快取，
 * cache-control 的斷言在那裡沒有意義。
 *
 * 這裡不自己 build。CI 的 Build 步驟已經 build 過一次，再 build 等於每次多花一輪；
 * 代價是本機改完程式要自己先 `pnpm build`，否則測到的是舊的產物。
 */
const SERVER_ENTRY = fileURLToPath(new URL('./.output/server/index.mjs', import.meta.url));

if (!existsSync(SERVER_ENTRY)) {
  throw new Error(`找不到 ${SERVER_ENTRY}：e2e 測的是 build 產物，請先跑 \`pnpm build\``);
}

// 刻意避開 3000：本機常開著 dev server，撞 port 時測到的會是 dev 而不是 build 產物
const APP_PORT = 4310;
const FAKE_SHEETS_PORT = 4311;
const HOST = '127.0.0.1';
const APP_URL = `http://${HOST}:${APP_PORT}`;
const FAKE_SHEETS_URL = `http://${HOST}:${FAKE_SHEETS_PORT}`;

export default defineConfig<ConfigOptions>({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  // 不重試：重試會把偶發失敗蓋掉，而這裡的斷言都是輪詢式的，本來就不該偶發
  retries: 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',

  use: {
    // 給了 host，@nuxt/test-utils 就不會自己再 build、再起一個 server
    nuxt: { host: APP_URL },
    trace: 'retain-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: [
    {
      name: 'fake-sheets',
      command: 'node test/e2e/fake-sheets/server.ts',
      url: `${FAKE_SHEETS_URL}/health`,
      env: { FAKE_SHEETS_PORT: String(FAKE_SHEETS_PORT) },
      // 一律自己起：沿用別人留下的 process，測到的不一定是這份程式碼
      reuseExistingServer: false,
    },
    {
      name: 'app',
      command: 'node .output/server/index.mjs',
      // 就緒訊號用 /api/sheet 而不是首頁：它只有在 app 真的連得到假 Sheets 時才回 200，
      // 接線壞掉時會在啟動階段就失敗，而不是讓每一支測試各自對著空頁面逾時
      url: `${APP_URL}/api/sheet?nocache`,
      env: {
        NITRO_HOST: HOST,
        NITRO_PORT: String(APP_PORT),
        // 都是假值。node 直接跑 build 產物不會讀 .env，真的 key 不會被帶進來
        NUXT_GSHEETS_KEY: 'e2e-fake-key',
        NUXT_SPREADSHEET_ID: 'e2e-fake-spreadsheet',
        NUXT_SHEETS_API_BASE: `${FAKE_SHEETS_URL}/v4/spreadsheets`,
      },
      reuseExistingServer: false,
    },
  ],
});
