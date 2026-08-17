import { defineConfig } from 'vitest/config';
import { defineVitestProject } from '@nuxt/test-utils/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: [
            'test/{e2e,unit}/**/*.{test,spec}.ts',
            'server/**/test/**/*.{test,spec}.ts',
            'shared/**/test/**/*.{test,spec}.ts',
            'app/**/test/{e2e,unit}/**/*.{test,spec}.ts',
          ],
          environment: 'node',
        },
        resolve: {
          alias: {
            '~~/': fileURLToPath(new URL('./', import.meta.url)),
            '~~': fileURLToPath(new URL('./', import.meta.url)),
          },
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts', 'app/**/test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
          /**
           * `environment: 'nuxt'` 會在 `beforeAll` 跑 `setupNuxt()`，冷啟（無 vite cache）
           * 時會超過 vitest 預設的 10s hookTimeout，症狀是隨機兩三支檔案吐
           * `Hook timed out in 10000ms`，單獨重跑卻全綠。
           *
           * CI 每次都是全新環境 → 必定冷啟 → 這是偶發紅燈的來源，與被判紅的
           * 那幾支測試本身無關。放寬到 30s：熱啟時本來就遠低於此，不會拖慢；
           * 真正的死鎖仍會在 30s 後被攔下。
           */
          hookTimeout: 30_000,
        },
      }),
    ],
  },
});
