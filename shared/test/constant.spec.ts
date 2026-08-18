import { describe, expect, it } from 'vitest';
import { AGENTS, IMAGE_HOSTS } from '../constant';

interface PhotoRef {
  url: string;
  agent: string;
  field: string;
}

/**
 * 收集 AGENTS 內所有照片 URL —— 圖鑑卡／頭像／個人頁共用的 picture，
 * 以及個人頁輪播的 photos。AGENTS 以名字與 emoji 雙 key 指向同一物件，故先去重。
 */
function collectPhotoUrls(): PhotoRef[] {
  const refs: PhotoRef[] = [];

  for (const agent of new Set(AGENTS.values())) {
    if (agent.picture) {
      refs.push({ url: agent.picture, agent: agent.name, field: 'picture' });
    }
    for (const [index, photo] of agent.photos.entries()) {
      refs.push({ url: photo, agent: agent.name, field: `photos[${index}]` });
    }
  }

  return refs;
}

describe('探員照片 host 白名單', () => {
  // 下面三條都是「offenders 為空」形式，收集函式若回空陣列會全數無條件通過。
  it('collectPhotoUrls 有實際收集到照片（防止下列斷言變成套套邏輯）', () => {
    expect(collectPhotoUrls().length).toBeGreaterThan(0);
  });

  // 這是「@nuxt/image 等於沒生效」那個 bug 的守衛：不在 image.domains 內的絕對 URL
  // 會被 validateDomains 原樣放行（原尺寸穿透），dev 與 CI 都不會有任何訊號。
  // 日後把照片搬到第三個 host 時，這條是唯一會出聲的地方。
  it('每張照片的 host 都必須列在 IMAGE_HOSTS（即 nuxt.config 的 image.domains）', () => {
    const allowed: readonly string[] = IMAGE_HOSTS;
    const offenders = collectPhotoUrls()
      .map((ref) => ({ ...ref, host: new URL(ref.url).host }))
      .filter((ref) => !allowed.includes(ref.host))
      .map((ref) => `${ref.agent}.${ref.field} → ${ref.host}`);

    expect(offenders).toEqual([]);
  });

  it('所有照片 URL 皆為合法的 https 絕對網址', () => {
    const offenders = collectPhotoUrls()
      .filter((ref) => !URL.canParse(ref.url) || new URL(ref.url).protocol !== 'https:')
      .map((ref) => `${ref.agent}.${ref.field} → ${ref.url}`);

    expect(offenders).toEqual([]);
  });

  // @nuxt/image 會把 domains 正規化成 host，帶協定或路徑寫進來不會報錯、只會靜默失效。
  it('IMAGE_HOSTS 只含裸 host，不帶協定或路徑', () => {
    for (const host of IMAGE_HOSTS) {
      expect(host).not.toContain('/');
      expect(host).not.toContain(':');
    }
  });
});

/**
 * `fileNo` 是探員頁「AGENT FILE · No. XXX」章顯示的編號，寫死在每一筆 entry 上。
 *
 * 寫死換來的是穩定（插入新探員不會讓其他人的編號位移），代價是複製既有 entry
 * 時很容易忘了改號碼 —— 而重複的編號在畫面上完全看不出異常，兩位探員各自的頁面
 * 都只顯示自己那一個。這幾條就是在補那個缺口。
 */
describe('探員 fileNo', () => {
  const agents = [...new Set(AGENTS.values())];

  it('有實際收集到探員（防止下列斷言變成套套邏輯）', () => {
    expect(agents.length).toBeGreaterThan(0);
  });

  it('每位探員都有 fileNo', () => {
    const offenders = agents
      .filter((agent) => !Number.isInteger(agent.fileNo) || agent.fileNo < 1)
      .map((agent) => `${agent.name} → ${agent.fileNo}`);

    expect(offenders).toEqual([]);
  });

  it('fileNo 不重複', () => {
    const seen = new Map<number, string>();
    const duplicates: string[] = [];

    for (const agent of agents) {
      const owner = seen.get(agent.fileNo);
      if (owner) {
        duplicates.push(`No.${agent.fileNo} → ${owner} / ${agent.name}`);
      } else {
        seen.set(agent.fileNo, agent.name);
      }
    }

    expect(duplicates).toEqual([]);
  });
});
