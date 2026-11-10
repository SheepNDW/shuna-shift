import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { coerce, satisfies, validRange } from 'semver';
import { parse as parseYaml } from 'yaml';
import { NITRO_SERVER_CHAIN, NITROPACK_CHAIN, resolvePackageJsonAlongChain } from './resolve-along-chain';

/**
 * 刻意鎖版的一致性守衛（鎖版本身的理由見 CLAUDE.md〈依賴版本策略〉）。
 *
 * 這幾條原本只靠人手跑指令與文件約定，而失效時**完全無聲**：
 *
 * - nitropack 的 override 無條件覆寫整棵樹，不檢查是否滿足任何 dependent 宣告的 range。
 *   升 `nuxt` 讓 `@nuxt/nitro-server` 改宣告更新的 nitropack 後，沒人動 override，
 *   整棵樹就被壓在沒測過的舊版 —— `pnpm install` 仍 exit 0、零警告；
 *   `cache-header.spec.ts` 的 canary 也無感，它讀的是安裝後的 `cache.mjs`，那個檔案沒變。
 *   連續三次升級批次都是靠人手跑 semver 比對才抓到。
 * - pnpm 11 起不再讀 `package.json` 的 `pnpm` 欄位，整個欄位被忽略、只印一行 WARN。
 *   設定寫回那裡，override 就悄悄失效，非 frozen 的 install 還會把 lockfile 裡的
 *   override 刪掉並 exit 0。
 * - `.nvmrc`（CI 的 setup-node 讀）與 `engines.node`（Vercel 讀）各自獨立。
 *   只改其中一邊，CI 與正式環境就跑在不同的 Node major 上，一樣沒有任何訊號。
 *
 * 做法：把檔案裡的值收成一份快照，丟給純函式 `checkPins` 比對、回傳問題清單。
 * 拆成純函式是為了讓「這支真的會紅」本身可以被測（下面的反向案例用造的快照），
 * 不必為了驗證去動真的檔案。
 *
 * `@nuxt/nitro-server` 與 nitropack 都是 transitive dependency，與 canary 一樣沿 app
 * 實際的依賴鏈解析（`resolvePackageJsonAlongChain`），讀到的就是 app 載入的那一份。
 */

/** 會互相牽制的值，全部收齊再比對 */
interface PinSnapshot {
  /** `@nuxt/nitro-server` 宣告的 `dependencies.nitropack` range */
  nitroServerRange: string;
  /** `pnpm-workspace.yaml` 的 `overrides.nitropack` */
  nitropackOverride: string;
  /** `package.json` 是否還留著 pnpm 11 起不再讀取的 `pnpm` 欄位 */
  hasLegacyPnpmField: boolean;
  /** 實際裝進 `node_modules` 的 nitropack 版本 */
  nitropackInstalled: string;
  /** `.nvmrc` 的內容 */
  nvmrc: string;
  /** `package.json` 的 `engines.node` */
  enginesNode: string;
}

const DOC_POINTER = '見 CLAUDE.md〈依賴版本策略〉';

const OVERRIDE_LABEL = 'pnpm-workspace.yaml 的 overrides.nitropack';

/** 沿路徑取值，中途不是物件就回 undefined，讓 JSON 結構變動時不會直接炸 TypeError */
function dig(value: unknown, path: readonly string[]): unknown {
  return path.reduce<unknown>(
    (current, key) =>
      current !== null && typeof current === 'object'
        ? (current as Record<string, unknown>)[key]
        : undefined,
    value,
  );
}

/** 欄位不見或型別不對時直接丟，症狀是「欄位不見了」而不是 semver 對 undefined 的誤判 */
function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${label} 必須是非空字串，實際為 ${JSON.stringify(value)}（${DOC_POINTER}）`);
  }
  return value.trim();
}

/** 讀專案根目錄下的檔案 */
function readRootFile(name: string): string {
  return readFileSync(new URL(`../../../${name}`, import.meta.url), 'utf8');
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readPins(): PinSnapshot {
  const rootPkg: unknown = JSON.parse(readRootFile('package.json'));
  const workspace: unknown = parseYaml(readRootFile('pnpm-workspace.yaml'));
  const nitroServerPkg = readJson(resolvePackageJsonAlongChain(NITRO_SERVER_CHAIN));
  const nitropackPkg = readJson(resolvePackageJsonAlongChain(NITROPACK_CHAIN));

  return {
    nitroServerRange: requireString(
      dig(nitroServerPkg, ['dependencies', 'nitropack']),
      '@nuxt/nitro-server 的 dependencies.nitropack',
    ),
    nitropackOverride: requireString(dig(workspace, ['overrides', 'nitropack']), OVERRIDE_LABEL),
    hasLegacyPnpmField: dig(rootPkg, ['pnpm']) !== undefined,
    nitropackInstalled: requireString(
      dig(nitropackPkg, ['version']),
      'node_modules 裡 nitropack 的 version',
    ),
    nvmrc: requireString(readRootFile('.nvmrc'), '.nvmrc'),
    enginesNode: requireString(dig(rootPkg, ['engines', 'node']), 'package.json 的 engines.node'),
  };
}

function checkLegacyPnpmField({ hasLegacyPnpmField }: PinSnapshot): string[] {
  if (!hasLegacyPnpmField) {
    return [];
  }

  return [
    'package.json 有 pnpm 欄位。pnpm 11 起整個欄位都不讀、只印一行 WARN，寫在裡面的 overrides 等設定會悄悄失效；'
    + `改寫進 pnpm-workspace.yaml（${DOC_POINTER}）`,
  ];
}

function checkNitropackPin({
  nitroServerRange,
  nitropackOverride,
  nitropackInstalled,
}: PinSnapshot): string[] {
  const problems: string[] = [];

  if (!satisfies(nitropackOverride, nitroServerRange)) {
    problems.push(
      `${OVERRIDE_LABEL}=${nitropackOverride} 不滿足 @nuxt/nitro-server 宣告的 nitropack@${nitroServerRange}。`
      + '先確認新版 nitropack 是否仍滿足 server/utils/cache.ts 的 s-maxage 推論'
      + '（跑 cache-header.spec.ts 的 canary），確認後再把 override 提到滿足宣告的最低版本'
      + `（${DOC_POINTER}）`,
    );
  }

  if (nitropackInstalled !== nitropackOverride) {
    problems.push(
      `node_modules 裝的 nitropack 是 ${nitropackInstalled}，與 ${OVERRIDE_LABEL}=${nitropackOverride} 不同：`
      + 'lockfile 或 node_modules 沒跟上 override，重跑 pnpm install',
    );
  }

  return problems;
}

function checkNodeVersion({ nvmrc, enginesNode }: PinSnapshot): string[] {
  if (validRange(enginesNode) === null) {
    return [`engines.node=${enginesNode} 不是合法的 semver range（${DOC_POINTER}）`];
  }

  const problems: string[] = [];
  const nvmrcVersion = coerce(nvmrc);

  if (!nvmrcVersion || !satisfies(nvmrcVersion, enginesNode)) {
    problems.push(
      `.nvmrc 的 ${nvmrc} 不在 engines.node=${enginesNode} 範圍內。`
      + `CI 讀 .nvmrc、Vercel 讀 engines.node，換 Node major 時兩邊要一起改（${DOC_POINTER}）`,
    );
  }

  // Vercel 會部署範圍允許的最高 major，所以範圍必須只含一個 major
  const major = coerce(enginesNode)?.major;
  if (major !== undefined && satisfies(`${major + 1}.0.0`, enginesNode)) {
    problems.push(
      `engines.node=${enginesNode} 允許超過一個 Node major（${major + 1}.0.0 也在範圍內）。`
      + `Vercel 會部署範圍允許的最高 major，下一個 Node major 上線時正式環境會無聲跳版；改成 ${major}.x`
      + `（${DOC_POINTER}）`,
    );
  }

  return problems;
}

/** 回傳違反的項目；空陣列代表全部一致。每條訊息都說清楚該改哪一邊 */
function checkPins(pins: PinSnapshot): string[] {
  return [...checkLegacyPnpmField(pins), ...checkNitropackPin(pins), ...checkNodeVersion(pins)];
}

/** 一份自洽的快照，反向案例各改一個欄位；第一條先證明它本身乾淨 */
const CONSISTENT: PinSnapshot = {
  nitroServerRange: '^2.13.6',
  nitropackOverride: '2.13.6',
  hasLegacyPnpmField: false,
  nitropackInstalled: '2.13.6',
  nvmrc: 'v24.22.2',
  enginesNode: '24.x',
};

describe('刻意鎖版的一致性守衛', () => {
  it('目前的 package.json / pnpm-workspace.yaml / node_modules / .nvmrc 應該全部一致', () => {
    expect(checkPins(readPins())).toEqual([]);
  });

  describe('checkPins 真的會紅（反向案例用造的快照，不動真的檔案）', () => {
    it('自洽的快照應該沒有問題（否則下面的案例會因為別的原因通過）', () => {
      expect(checkPins(CONSISTENT)).toEqual([]);
    });

    it('升 nuxt 後 override 落後 @nuxt/nitro-server 宣告時，應該要求先跑 canary 再提 pin', () => {
      const problems = checkPins({ ...CONSISTENT, nitroServerRange: '^2.14.0' });

      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain('overrides.nitropack=2.13.6 不滿足');
      expect(problems[0]).toContain('canary');
    });

    it('package.json 又出現 pnpm 欄位時，應該指出 pnpm 11 起不讀、要改放 pnpm-workspace.yaml', () => {
      const problems = checkPins({ ...CONSISTENT, hasLegacyPnpmField: true });

      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain('pnpm 11 起整個欄位都不讀');
      expect(problems[0]).toContain('pnpm-workspace.yaml');
    });

    it('override 提了但 node_modules 還是舊版時，應該指向重跑 pnpm install', () => {
      const problems = checkPins({ ...CONSISTENT, nitropackOverride: '2.13.7' });

      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain('pnpm install');
    });

    it('.nvmrc 換了 major 但 engines.node 沒跟上時，應該要求兩邊一起改', () => {
      const problems = checkPins({ ...CONSISTENT, nvmrc: 'v26.0.0' });

      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain('.nvmrc 的 v26.0.0 不在 engines.node=24.x');
    });

    it('engines.node 退回 >=24 這種沒封頂的寫法時，應該指出 Vercel 會跳 major', () => {
      const problems = checkPins({ ...CONSISTENT, enginesNode: '>=24' });

      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain('Vercel');
      expect(problems[0]).toContain('改成 24.x');
    });
  });
});
