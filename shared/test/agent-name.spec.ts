import { describe, expect, it } from 'vitest';
import { isSelectedAgentCell, parseAgentCell } from '../utils/agent-name';

/**
 * 歷史班表（`過去班表20260101~`）的真實儲存格樣本 —— 括號的兩種語意各取幾筆，
 * 免得用手編的假字串測出「看起來對但真實資料不長這樣」的結論。
 *
 * 期望值一律硬編碼，不由 cell 字串推導：拿與受測程式同一套剝括號手術算期望值，
 * 切法整體錯位時兩邊會一起錯而仍然綠燈。
 */
const REAL_CELLS = {
  substitute: [
    { cell: '和実(亞米)', name: '和実', original: '亞米' },
    { cell: '千熊(三里)', name: '千熊', original: '三里' },
    { cell: '悠莉(璐奈)', name: '悠莉', original: '璐奈' },
  ],
  time: '亞米(~18:00)',
} as const;

describe('parseAgentCell', () => {
  describe('無括號', () => {
    it('回傳正規化後的名稱且不帶註記', () => {
      expect(parseAgentCell('泠泠')).toEqual({ name: '泠泠', note: null });
      expect(parseAgentCell(' Luna ')).toEqual({ name: 'Luna', note: null });
    });

    it('emoji 與別名一併正規化為 AGENTS 鍵值', () => {
      expect(parseAgentCell('🐷').name).toBe('泠泠');
      expect(parseAgentCell('いろは').name).toBe('Iroha');
      expect(parseAgentCell('luna').name).toBe('Luna');
    });

    it('查無此人時原樣回傳', () => {
      expect(parseAgentCell('查無此人')).toEqual({ name: '查無此人', note: null });
    });
  });

  describe('括號＝原班探員', () => {
    it.each(REAL_CELLS.substitute)('$cell 的當班者為括號前的探員', ({ cell, name, original }) => {
      expect(parseAgentCell(cell)).toEqual({
        name,
        note: { kind: 'original-agent', agent: original },
      });
    });

    it('全形括號等同半形', () => {
      expect(parseAgentCell('小楓（泠泠）')).toEqual({
        name: '小楓',
        note: { kind: 'original-agent', agent: '泠泠' },
      });
    });

    it('括號內的 emoji 與別名一併正規化', () => {
      expect(parseAgentCell('小楓(🐷)').note).toEqual({
        kind: 'original-agent',
        agent: '泠泠',
      });
    });

    it('名稱與括號間有空格時仍剝得乾淨', () => {
      expect(parseAgentCell('小楓 (泠泠)')).toEqual({
        name: '小楓',
        note: { kind: 'original-agent', agent: '泠泠' },
      });
    });

    it('第二組括號不混進註記', () => {
      expect(parseAgentCell('小楓(泠泠)(換)')).toEqual({
        name: '小楓',
        note: { kind: 'original-agent', agent: '泠泠' },
      });
    });
  });

  describe('括號＝時間註記', () => {
    it('不把時間當成原班探員', () => {
      expect(parseAgentCell(REAL_CELLS.time)).toEqual({
        name: '亞米',
        note: { kind: 'time', text: '~18:00' },
      });
    });

    it('全形波浪與半形時間格式皆判為時間', () => {
      expect(parseAgentCell('亞米（～18:00）').note).toEqual({
        kind: 'time',
        text: '～18:00',
      });
      expect(parseAgentCell('亞米(18:00~)').note).toEqual({
        kind: 'time',
        text: '18:00~',
      });
      expect(parseAgentCell('亞米(18:00)').note).toEqual({
        kind: 'time',
        text: '18:00',
      });
    });

    it('右括號後還跟著字時只取括號內容', () => {
      expect(parseAgentCell('亞米(~18:00)備註').note).toEqual({
        kind: 'time',
        text: '~18:00',
      });
    });

    it('只有數字不算時間形狀', () => {
      expect(parseAgentCell('亞米(2樓)').note).toEqual({ kind: 'unknown', text: '2樓' });
      expect(parseAgentCell('小楓(代1)').note).toEqual({ kind: 'unknown', text: '代1' });
    });
  });

  describe('無法判定的括號', () => {
    it('括號內既非探員也非時間時標為 unknown 並保留原字串', () => {
      expect(parseAgentCell('亞米(待確認)')).toEqual({
        name: '亞米',
        note: { kind: 'unknown', text: '待確認' },
      });
    });

    it('括號內為空時視為沒有註記', () => {
      expect(parseAgentCell('亞米()')).toEqual({ name: '亞米', note: null });
    });

    it('括號未閉合仍取得當班者', () => {
      expect(parseAgentCell('亞米(~18:00')).toEqual({
        name: '亞米',
        note: { kind: 'time', text: '~18:00' },
      });
    });

    it('括號前沒有名字時整格原樣留著', () => {
      expect(parseAgentCell('(泠泠)')).toEqual({ name: '(泠泠)', note: null });
    });

    it('空字串不炸', () => {
      expect(parseAgentCell('')).toEqual({ name: '', note: null });
    });
  });
});

describe('isSelectedAgentCell', () => {
  it('選中的探員能命中其帶括號的班次', () => {
    const selected = new Set(['亞米']);

    expect(isSelectedAgentCell('亞米', selected)).toBe(true);
    expect(isSelectedAgentCell('亞米(~18:00)', selected)).toBe(true);
    expect(isSelectedAgentCell('亞米(璐奈)', selected)).toBe(true);
  });

  it('括號內的被代班探員不算當班，不應被誤命中', () => {
    expect(isSelectedAgentCell('和実(亞米)', new Set(['和実']))).toBe(true);
    expect(isSelectedAgentCell('和実(亞米)', new Set(['亞米']))).toBe(false);
  });

  it('emoji 儲存格能被正式名稱命中', () => {
    expect(isSelectedAgentCell('🐷', new Set(['泠泠']))).toBe(true);
  });

  it('未選中的探員不命中', () => {
    expect(isSelectedAgentCell('泠泠', new Set(['亞米']))).toBe(false);
    expect(isSelectedAgentCell('泠泠', new Set())).toBe(false);
  });
});
