import { describe, expect, it } from 'vitest';
import { getNightShiftIconColor, getNightShiftTime, NIGHT_SHIFT_COLOR_MAP } from '../../colors';

describe('colors utils', () => {
  describe('getNightShiftTime', () => {
    it('當文字顏色為 GREEN_SHIFT 時應回傳對應的時段', () => {
      const result = getNightShiftTime(NIGHT_SHIFT_COLOR_MAP.GREEN_SHIFT);

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

    it('當文字顏色為 ORANGE_SHIFT 時應回傳對應的顏色', () => {
      const result = getNightShiftIconColor(NIGHT_SHIFT_COLOR_MAP.ORANGE_SHIFT);

      expect(result).toBe(NIGHT_SHIFT_COLOR_MAP.ORANGE_SHIFT);
    });

    it('當文字顏色不在預設清單時應回傳空字串', () => {
      const result = getNightShiftIconColor('#abcdef');

      expect(result).toBe('');
    });
  });
});
