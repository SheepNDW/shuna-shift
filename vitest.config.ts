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
        },
      }),
    ],
  },
});
