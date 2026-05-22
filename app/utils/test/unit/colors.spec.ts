import { describe, expect, it } from 'vitest';
import { rgbToHex } from '~~/server/utils/parser';
import {
  getNightShiftIconColor,
  getNightShiftTime,
  NIGHT_SHIFT_COLOR_MAP,
  SUBSTITUTE_COLOR_MAP,
} from '../../colors';

describe('colors utils', () => {
  describe('getNightShiftTime', () => {
    it('當文字顏色為 GREEN_SHIFT 時應回傳對應的時段', () => {
      const result = getNightShiftTime(NIGHT_SHIFT_COLOR_MAP.GREEN_SHIFT);

      expect(result).toBe('15:00 ~ 19:30');
    });

    it('相近綠 #70ad47（色卡填錯的別名）應視為綠班', () => {
      const result = getNightShiftTime('#70ad47');

      expect(result).toBe('15:00 ~ 19:30');
    });

    it('當文字顏色為 ORANGE_SHIFT 時應回傳對應的時段', () => {
      const result = getNightShiftTime(NIGHT_SHIFT_COLOR_MAP.ORANGE_SHIFT);

      expect(result).toBe('16:00 ~ 21:30');
    });

    it('當文字顏色不在預設清單時應回傳預設時段', () => {
      const result = getNightShiftTime('#abcdef');

      expect(result).toBe('17:30 ~ 21:30');
    });
  });

  describe('getNightShiftIconColor', () => {
    it('當文字顏色為 GREEN_SHIFT 時應回傳對應的顏色', () => {
      const result = getNightShiftIconColor(NIGHT_SHIFT_COLOR_MAP.GREEN_SHIFT);

      expect(result).toBe(NIGHT_SHIFT_COLOR_MAP.GREEN_SHIFT);
    });

    it('相近綠 #70ad47 應正規化回 canonical 綠', () => {
      const result = getNightShiftIconColor('#70ad47');

      expect(result).toBe(NIGHT_SHIFT_COLOR_MAP.GREEN_SHIFT);
    });

    it('當文字顏色為 ORANGE_SHIFT 時應回傳對應的顏色', () => {
      const result = getNightShiftIconColor(NIGHT_SHIFT_COLOR_MAP.ORANGE_SHIFT);

      expect(result).toBe(NIGHT_SHIFT_COLOR_MAP.ORANGE_SHIFT);
    });

    it('當文字顏色不在預設清單時應回傳空字串', () => {
      const result = getNightShiftIconColor('#abcdef');

      expect(result).toBe('');
    });
  });

  // 回歸測試(PR #26 review M6):SUBSTITUTE_COLOR_MAP 的色碼必須與 parser
  // `rgbToHex` 對試算表紅 / 藍字的輸出完全相等,否則 AgentScheduleCard 的
  // 代班 / 換班標記永遠比對不到。舊值 #ef4444 / #3b82f6(Tailwind 色碼)即因
  // 與 parser 輸出不符而長期遮蔽此 bug。色碼校正自實際試算表(過去班表 2024–2025)。
  describe('SUBSTITUTE_COLOR_MAP 與 parser 輸出對齊', () => {
    it('代班色為試算表純紅字,等同 parser 對純紅的輸出 (#ff0000)', () => {
      expect(SUBSTITUTE_COLOR_MAP.SUBSTITUTE).toBe('#ff0000');
      expect(SUBSTITUTE_COLOR_MAP.SUBSTITUTE).toBe(rgbToHex({ red: 1, green: 0, blue: 0 }));
    });

    it('換班色為試算表藍字,等同 parser 對該藍的輸出 (#1155cc)', () => {
      expect(SUBSTITUTE_COLOR_MAP.EXCHANGE).toBe('#1155cc');
      expect(SUBSTITUTE_COLOR_MAP.EXCHANGE).toBe(
        rgbToHex({ red: 17 / 255, green: 85 / 255, blue: 204 / 255 })
      );
    });
  });
});
