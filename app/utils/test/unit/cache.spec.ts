import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeTtlCache, reusePayloadData } from '../../cache';

const TTL = 2 * 60 * 60 * 1000;
const NOW = new Date('2024-10-28T12:00:00.000Z');

interface Cached {
  metadata?: { lastUpdated?: string };
}

/** 以 NOW 為基準往前推 n 毫秒的 ISO 字串 */
const agoIso = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

const source = (payload: Record<string, unknown>, staticData: Record<string, unknown> = {}) => ({
  payload: { data: payload },
  static: { data: staticData },
});

describe('makeTtlCache', () => {
  beforeEach(() => {
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('資料在 TTL 內時應回傳快取', () => {
    const cached: Cached = { metadata: { lastUpdated: agoIso(60 * 1000) } };

    const result = makeTtlCache<Cached>(TTL)('statistics', source({ statistics: cached }));

    expect(result).toBe(cached);
  });

  it('資料超過 TTL 時應回傳 undefined', () => {
    const cached: Cached = { metadata: { lastUpdated: agoIso(TTL + 1) } };

    const result = makeTtlCache<Cached>(TTL)('statistics', source({ statistics: cached }));

    expect(result).toBeUndefined();
  });

  // 邊界：剛好等於 TTL 仍算新鮮，超過才過期
  it('資料剛好等於 TTL 時應回傳快取', () => {
    const cached: Cached = { metadata: { lastUpdated: agoIso(TTL) } };

    const result = makeTtlCache<Cached>(TTL)('statistics', source({ statistics: cached }));

    expect(result).toBe(cached);
  });

  it('沒有對應 key 時應回傳 undefined', () => {
    const result = makeTtlCache<Cached>(TTL)('statistics', source({}));

    expect(result).toBeUndefined();
  });

  it('payload 沒有時應退回 static', () => {
    const cached: Cached = { metadata: { lastUpdated: agoIso(60 * 1000) } };

    const result = makeTtlCache<Cached>(TTL)('statistics', source({}, { statistics: cached }));

    expect(result).toBe(cached);
  });

  // 不知道資料多舊就當它是舊的：寧可多打一次 API，也不要顯示一份來歷不明的快取
  it('lastUpdated 缺漏時應回傳 undefined', () => {
    const result = makeTtlCache<Cached>(TTL)('statistics', source({ statistics: {} }));

    expect(result).toBeUndefined();
  });

  it('lastUpdated 不是合法時間時應回傳 undefined', () => {
    const cached: Cached = { metadata: { lastUpdated: 'not-a-date' } };

    const result = makeTtlCache<Cached>(TTL)('statistics', source({ statistics: cached }));

    expect(result).toBeUndefined();
  });

  // 未來時間戳（伺服器時鐘偏移或值寫壞）若不擋，now - fetchedAt 為負，永遠不會
  // 超過 ttl，那份資料會被當成永遠新鮮而一直用下去。
  it('lastUpdated 落在未來時應回傳 undefined', () => {
    const cached: Cached = { metadata: { lastUpdated: agoIso(-60 * 1000) } };

    const result = makeTtlCache<Cached>(TTL)('statistics', source({ statistics: cached }));

    expect(result).toBeUndefined();
  });
});

/**
 * 這支是「全站一次 SSR 只打一次 /api/sheet」保證的落點：把 `??` 換成 `||`
 * 或拿掉 static fallback 都會無聲破壞單次請求保證，所以直接測函式本身
 * （useSchedules 的測試把 useFetch 整個 mock 掉，這支在那裡只是個被傳遞的參考）。
 */
describe('reusePayloadData', () => {
  it('payload 命中時應回傳該筆', () => {
    const cached = { schedules: [] };

    expect(reusePayloadData('schedules', source({ schedules: cached }))).toBe(cached);
  });

  it('payload 沒有時應退回 static', () => {
    const cached = { schedules: [] };

    expect(reusePayloadData('schedules', source({}, { schedules: cached }))).toBe(cached);
  });

  it('兩邊都沒有時應回傳 undefined —— 這是觸發實際請求的唯一路徑', () => {
    expect(reusePayloadData('schedules', source({}))).toBeUndefined();
  });

  // Nuxt 會把「已清掉」寫成 undefined 而非刪 key，因此不能只用 `key in data` 判斷
  it('payload 該 key 為 undefined 時應退回 static', () => {
    const cached = { schedules: [] };

    expect(reusePayloadData('schedules', source({ schedules: undefined }, { schedules: cached }))).toBe(
      cached,
    );
  });
});
