import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AgentPhotoCarousel from '../../AgentPhotoCarousel.vue';

// UCarousel 只取它「對每個 item 渲染一次 default scoped slot」的契約，
// embla 的捲動行為屬於 e2e 範圍，不在單元測試裡驗。
const UCarouselStub = defineComponent({
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  template: `
    <div data-testid="carousel">
      <template v-for="(item, index) in items" :key="index">
        <slot :item="item" :index="index" />
      </template>
    </div>
  `,
});

const NuxtImgStub = defineComponent({
  props: {
    src: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: '',
    },
  },
  template: '<img :src="src" :alt="alt" />',
});

const stubs = {
  UCarousel: UCarouselStub,
  NuxtImg: NuxtImgStub,
} as const;

const photos = ['https://example.com/a.jpg', 'https://example.com/b.jpg'];

describe('AgentPhotoCarousel', () => {
  it('每張照片各渲染一格，alt 帶入探員名與序號', async () => {
    const wrapper = await mountSuspended(AgentPhotoCarousel, {
      props: { photos, agentName: '泠泠' },
      global: { stubs },
    });

    const images = wrapper.findAll('[data-testid="agent-photo-image"]');
    expect(images).toHaveLength(2);
    expect(images[0]?.attributes('src')).toBe(photos[0]);
    expect(images[0]?.attributes('alt')).toBe('泠泠 照片 1');
    expect(images[1]?.attributes('alt')).toBe('泠泠 照片 2');
  });

  // 這裡是全站最大的圖（448px 方形，2x 即 896）。缺 width 會被 @nuxt/image
  // 退回 screens 最大值，且 dev 模式看不出來 —— 只有正式站流量會爆。
  it('照片帶顯式尺寸，避免圖片最佳化退化成最大寬度', async () => {
    const wrapper = await mountSuspended(AgentPhotoCarousel, {
      props: { photos, agentName: '泠泠' },
      global: { stubs },
    });

    for (const img of wrapper.findAll('[data-testid="agent-photo-image"]')) {
      expect(img.attributes('width')).toBe('448');
      expect(img.attributes('height')).toBe('448');
    }
  });

  it('沒有照片時不渲染任何圖片', async () => {
    const wrapper = await mountSuspended(AgentPhotoCarousel, {
      props: { photos: [], agentName: '泠泠' },
      global: { stubs },
    });

    expect(wrapper.findAll('[data-testid="agent-photo-image"]')).toHaveLength(0);
  });

  /**
   * 照片牆的圖全在外部 host（其中 77 張在別家公司的 dev 環境 CDN）。
   * 失敗的那一張換成說明文字，其餘照常顯示 —— 整片消失會讓人以為探員沒有照片。
   */
  it('單張載入失敗只換掉那一格，其餘照片不受影響', async () => {
    const wrapper = await mountSuspended(AgentPhotoCarousel, {
      props: { photos, agentName: '泠泠' },
      global: { stubs },
    });

    await wrapper.findAll('[data-testid="agent-photo-image"]')[0]!.trigger('error');

    const remaining = wrapper.findAll('[data-testid="agent-photo-image"]');
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.attributes('src')).toBe(photos[1]);
    expect(wrapper.findAll('[data-testid="agent-photo-fallback"]')).toHaveLength(1);
  });
});
