import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeTtlCache } from '../../cache';

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
});
