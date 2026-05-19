import { describe, expect, it } from 'vitest';
import { padZero } from '../../format';

describe('padZero', () => {
  it('個位數應補零成兩位', () => {
    expect(padZero(0)).toBe('00');
    expect(padZero(3)).toBe('03');
    expect(padZero(9)).toBe('09');
  });

  it('兩位數應維持原樣', () => {
    expect(padZero(10)).toBe('10');
    expect(padZero(28)).toBe('28');
  });

  it('超過兩位數不截斷', () => {
    expect(padZero(100)).toBe('100');
  });
});
