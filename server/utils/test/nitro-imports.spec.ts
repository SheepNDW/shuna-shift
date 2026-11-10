import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ROOT_PACKAGE_JSON } from './resolve-along-chain';

/**
 * nitro 會把 `server/utils/**` 底下所有 export 收進 server 端的 auto-import，
 * 連 `test/` 子目錄裡的 fixture 與測試 helper 也不例外 —— 它們會變成 server 程式碼的
 * 全域名稱，正式程式碼誤用到測試資料時 lint 與 typecheck 都不會出聲。
 * `nuxt.config.ts` 的 `nitro.imports.dirs` 用排除規則擋掉，這支確認排除真的生效。
 *
 * 讀的是 `nuxt prepare` 產生的型別宣告（`pnpm install` 的 postinstall 會跑），
 * 不需要真的啟動 nitro。
 */
const NITRO_IMPORTS_DTS = join(dirname(ROOT_PACKAGE_JSON), '.nuxt/types/nitro-imports.d.ts');

function readNitroImports(): string {
  if (!existsSync(NITRO_IMPORTS_DTS)) {
    throw new Error(`找不到 ${NITRO_IMPORTS_DTS}：先跑 nuxt prepare（pnpm install 的 postinstall 會跑）`);
  }
  return readFileSync(NITRO_IMPORTS_DTS, 'utf8');
}

describe('server 端 auto-import', () => {
  it('不應該收進任何 test 目錄底下的檔案', () => {
    const leaked = readNitroImports()
      .split('\n')
      .filter((line) => /[/\\]test[/\\]/.test(line));

    expect(leaked).toEqual([]);
  });

  it('server/utils 底下真正的 util 仍然要收進來（排除規則寫太寬時會整個失效）', () => {
    expect(readNitroImports()).toContain('formatErrorForLog');
  });
});
