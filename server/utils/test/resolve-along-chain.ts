import { realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

/** 專案根目錄的 package.json，依賴鏈的起點 */
export const ROOT_PACKAGE_JSON = fileURLToPath(new URL('../../../package.json', import.meta.url));

/** app 載入 nitro 的實際路徑：nuxt 是直接依賴，後兩層都是 transitive */
export const NITRO_SERVER_CHAIN = ['nuxt', '@nuxt/nitro-server'] as const;
export const NITROPACK_CHAIN = [...NITRO_SERVER_CHAIN, 'nitropack'] as const;
/** server 端執行時的 h3 是 nitro runtime 解析到的那一份 */
export const H3_CHAIN = [...NITROPACK_CHAIN, 'h3'] as const;

/**
 * 沿依賴鏈逐層解析，回傳鏈尾套件 `package.json` 的實際路徑。
 *
 * 每一層都從上一層 `package.json` 的 realpath 出發解析，等於重走 Node 執行時真正
 * 走的那條路：找到的就是 app 載入的那一份，而不是剛好被攤平到根 `node_modules`
 * 的某一份。transitive dependency 也因此不需要任何 hoist 設定就解析得到。
 *
 * 任何一層解析不到時，丟出的錯誤會指出斷在鏈上的哪一層。
 */
export function resolvePackageJsonAlongChain(chain: readonly string[]): string {
  return chain.reduce((fromPath, name, index) => {
    try {
      return realpathSync(createRequire(fromPath).resolve(`${name}/package.json`));
    } catch (error) {
      const walked = ['<root>', ...chain.slice(0, index + 1)].join(' → ');
      throw new Error(`沿依賴鏈解析失敗，斷在 ${walked}`, { cause: error });
    }
  }, ROOT_PACKAGE_JSON);
}
