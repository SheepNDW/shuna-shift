import { describe, expect, it } from 'vitest';
import type { TextFormatRun } from '~~/shared/types';
import { normalizeAgentName } from '~~/shared/constant';
import { excelSerialToDateLabel, parseAgents, parseShiftType, rgbToHex } from '../parser';

describe('excelSerialToDateLabel', () => {
  it('應該將 Excel 序列號轉換為日期標籤', () => {
    // Excel 序列號 45292 對應 2024年1月1日
    expect(excelSerialToDateLabel(45292)).toBe('1月1日');
  });
});

describe('rgbToHex', () => {
  it('應該將 RGB 顏色轉換為十六進位格式', () => {
    expect(rgbToHex({ red: 0.576, green: 0.769, blue: 0.49 })).toBe('#93c47d');
    expect(rgbToHex({ red: 1, green: 0.6 })).toBe('#ff9900');
  });

  it('應該處理純色', () => {
    expect(rgbToHex({ red: 1, green: 0, blue: 0 })).toBe('#ff0000'); // 紅色
    expect(rgbToHex({ red: 0, green: 1, blue: 0 })).toBe('#00ff00'); // 綠色
    expect(rgbToHex({ red: 0, green: 0, blue: 1 })).toBe('#0000ff'); // 藍色
  });

  it('應該處理黑色和白色', () => {
    expect(rgbToHex({ red: 0, green: 0, blue: 0 })).toBe('#000000'); // 黑色
    expect(rgbToHex({ red: 1, green: 1, blue: 1 })).toBe('#ffffff'); // 白色
  });

  it('應該處理缺少的顏色值（預設為 0）', () => {
    expect(rgbToHex({})).toBe('#000000');
    expect(rgbToHex({ red: 0.5 })).toBe('#800000');
    expect(rgbToHex({ green: 0.5 })).toBe('#008000');
    expect(rgbToHex({ blue: 0.5 })).toBe('#000080');
  });
});

describe('parseAgents', () => {
  it('應該解析帶有顏色格式的探員名單', () => {
    const name = '🐷、🌙、小春、七尾、紅、百夜';

    const runs: TextFormatRun[] = [
      {
        startIndex: 9,
        format: {
          foregroundColor: {
            red: 0.5764706,
            green: 0.76862746,
            blue: 0.49019608,
          },
          foregroundColorStyle: {
            rgbColor: {
              red: 0.5764706,
              green: 0.76862746,
              blue: 0.49019608,
            },
          },
        },
      },
      {
        startIndex: 11,
        format: {
          foregroundColor: {},
          strikethrough: false,
          foregroundColorStyle: {
            rgbColor: {},
          },
        },
      },
    ];

    const result = parseAgents(name, runs);

    expect(result).toEqual([
      { name: '泠泠', textColor: '' },
      { name: 'Luna', textColor: '' },
      { name: '小春', textColor: '' },
      { name: '七尾', textColor: '#93c47d' },
      { name: '紅', textColor: '' },
      { name: '百夜', textColor: '' },
    ]);
  });

  it('應該解析帶有顏色格式的探員名單', () => {
    const name = '🐷、🥨、七尾、三里、亞米(和実)、棠棠';

    const runs: TextFormatRun[] = [
      {
        startIndex: 12,
        format: {
          foregroundColor: {
            red: 1,
          },
          foregroundColorStyle: {
            rgbColor: {
              red: 1,
            },
          },
        },
      },
      {
        startIndex: 14,
        format: {},
      },
      {
        startIndex: 15,
        format: {
          foregroundColor: {
            red: 0.6,
            green: 0.6,
            blue: 0.6,
          },
          foregroundColorStyle: {
            rgbColor: {
              red: 0.6,
              green: 0.6,
              blue: 0.6,
            },
          },
        },
      },
      {
        startIndex: 17,
        format: {},
      },
    ];

    const result = parseAgents(name, runs);

    expect(result).toEqual([
      { name: '泠泠', textColor: '' },
      { name: '米捲', textColor: '' },
      { name: '七尾', textColor: '' },
      { name: '三里', textColor: '' },
      { name: '亞米(和実)', textColor: '#ff0000' },
      { name: '棠棠', textColor: '' },
    ]);
  });

  it('應該將 いろは 正規化為 Iroha', () => {
    const name = 'いろは、百夜';
    const result = parseAgents(name);

    expect(result).toEqual([
      { name: 'Iroha', textColor: '' },
      { name: '百夜', textColor: '' },
    ]);
  });

  it('應該將 kikimi 正規化為 Kikimi（不區分大小寫）', () => {
    const name = 'kikimi、小楓';
    const result = parseAgents(name);

    expect(result).toEqual([
      { name: 'Kikimi', textColor: '' },
      { name: '小楓', textColor: '' },
    ]);
  });

  it('應該將 🍊 與 蜜柑 正規化為同一位探員（蜜柑轉正職後的 emoji 標示）', () => {
    const result = parseAgents('🍊、蜜柑');

    expect(result).toEqual([
      { name: '蜜柑', textColor: '' },
      { name: '蜜柑', textColor: '' },
    ]);
  });
});

describe('parseShiftType', () => {
  it('應該將「早」解析為 day', () => {
    expect(parseShiftType('早')).toBe('day');
  });

  it('應該將「晚」解析為 night', () => {
    expect(parseShiftType('晚')).toBe('night');
  });

  it('應該容忍前後空白', () => {
    expect(parseShiftType(' 早 ')).toBe('day');
    expect(parseShiftType('晚\n')).toBe('night');
  });

  it('空白、undefined 或無法判定的值應回傳空字串', () => {
    expect(parseShiftType('')).toBe('');
    expect(parseShiftType(undefined)).toBe('');
    expect(parseShiftType('中')).toBe('');
  });
});

describe('normalizeAgentName', () => {
  it('應該將 いろは 轉換為 Iroha', () => {
    expect(normalizeAgentName('いろは')).toBe('Iroha');
  });

  it('應該將 kikimi 轉換為 Kikimi（不區分大小寫）', () => {
    expect(normalizeAgentName('kikimi')).toBe('Kikimi');
  });

  it('應該將 🍊 轉換為 蜜柑（蜜柑轉正職後的 emoji 標示）', () => {
    expect(normalizeAgentName('🍊')).toBe('蜜柑');
  });

  it('應該將正職探員的 emoji 轉換為正式名稱（由 AGENTS 的 emoji 欄位自動建表）', () => {
    expect(normalizeAgentName('🐷')).toBe('泠泠');
    expect(normalizeAgentName('🌙')).toBe('Luna');
    expect(normalizeAgentName('🥨')).toBe('米捲');
  });

  it('應該保留已正確的名稱不變', () => {
    expect(normalizeAgentName('Iroha')).toBe('Iroha');
    expect(normalizeAgentName('Kikimi')).toBe('Kikimi');
    expect(normalizeAgentName('百夜')).toBe('百夜');
  });

  it('應該保留未知名稱不變', () => {
    expect(normalizeAgentName('不存在的探員')).toBe('不存在的探員');
  });
});
