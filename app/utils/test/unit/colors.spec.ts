import { describe, expect, it } from 'vitest';
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

  // 回歸測試(PR #26 review M6 / L-recheck-1):SUBSTITUTE_COLOR_MAP 的色碼
  // 必須等於 parser 對試算表紅 / 藍字儲存格的實際輸出。舊值 #ef4444 / #3b82f6
  // (Tailwind 色碼)即因與 parser 輸出不符而長期遮蔽 bug。
  // 「parser 對真實儲存格 → 此色碼」由 parser 測試以真實過去班表資料錨定
  // (server/utils/test/parset.spec.ts 的 parseAgents 代班 #ff0000 / 換班
  // #1155cc 案例);此處只負責鎖定常數本身、確保不被改錯。
  describe('SUBSTITUTE_COLOR_MAP 色碼鎖定', () => {
    it('代班色為試算表紅字 #ff0000', () => {
      expect(SUBSTITUTE_COLOR_MAP.SUBSTITUTE).toBe('#ff0000');
    });

    it('換班色為試算表藍字 #1155cc', () => {
      expect(SUBSTITUTE_COLOR_MAP.EXCHANGE).toBe('#1155cc');
    });
  });
});
