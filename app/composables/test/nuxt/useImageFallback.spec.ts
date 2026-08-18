import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useImageFallback } from '~/composables/useImageFallback';

describe('useImageFallback', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('未回報過的 URL 視為正常', () => {
    const { hasFailed } = useImageFallback();

    expect(hasFailed('https://example.com/a.jpg')).toBe(false);
  });

  it('回報後該 URL 標記為失敗', () => {
    const { hasFailed, onImageError } = useImageFallback();

    onImageError('https://example.com/a.jpg');

    expect(hasFailed('https://example.com/a.jpg')).toBe(true);
  });

  it('只標記回報過的那一張，不牽連其他圖', () => {
    const { hasFailed, onImageError } = useImageFallback();

    onImageError('https://example.com/a.jpg');

    expect(hasFailed('https://example.com/b.jpg')).toBe(false);
  });

  /**
   * 上游 host 掛掉時全站圖片會同時消失，而 `<NuxtImg>` 預設不留任何痕跡。
   * 這行 warn 是唯一的訊號來源，掉了就等於整個 fallback 靜默生效。
   */
  it('首次失敗時發出帶 URL 的 console.warn', () => {
    const { onImageError } = useImageFallback();

    onImageError('https://example.com/a.jpg');

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(vi.mocked(console.warn).mock.calls[0]?.[0]).toContain('https://example.com/a.jpg');
  });

  it('同一個 URL 重複回報只 warn 一次', () => {
    const { onImageError } = useImageFallback();

    onImageError('https://example.com/a.jpg');
    onImageError('https://example.com/a.jpg');

    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('每次呼叫各自持有狀態，不會互相污染', () => {
    const first = useImageFallback();
    const second = useImageFallback();

    first.onImageError('https://example.com/a.jpg');

    expect(second.hasFailed('https://example.com/a.jpg')).toBe(false);
  });
});
