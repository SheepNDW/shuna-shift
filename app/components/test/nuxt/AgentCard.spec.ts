import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AgentCard from '../../AgentCard.vue';
import type { Agent } from '~~/shared/types';

const NuxtLinkStub = defineComponent({
  inheritAttrs: false,
  template: '<a v-bind="$attrs"><slot /></a>',
});

const NuxtImgStub = defineComponent({
  props: {
    src: { type: String, default: '' },
    alt: { type: String, default: '' },
  },
  template: '<img :src="src" :alt="alt" />',
});

const stubs = {
  NuxtLink: NuxtLinkStub,
  NuxtImg: NuxtImgStub,
} as const;

const baseAgent: Agent = {
  id: 'rin',
  name: '泠泠',
  fileNo: 1,
  picture: 'https://example.com/rin.jpg',
  photos: [],
  instagram: 'https://www.instagram.com/shuna.rin_/',
  isFullTime: true,
  emoji: '🐷',
};

describe('AgentCard', () => {
  // @nuxt/image 的 vercel provider 在沒有 width 時會退回 screens 的最大值（1536），
  // 且 dev 模式直接回傳原圖 → 尺寸掉了在本機完全看不出來，只有正式站流量會爆。
  it('照片帶顯式尺寸，避免圖片最佳化退化成最大寬度', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: baseAgent },
      global: { stubs },
    });

    const img = wrapper.get('[data-testid="agent-card-image"]');
    expect(img.attributes('width')).toBe('360');
    expect(img.attributes('height')).toBe('270');
  });

  it('連結指向探員詳情頁', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: baseAgent },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-card"]').attributes('to')).toBe('/agents/rin');
  });

  it('顯示名字、emoji 章與 IG handle', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: baseAgent },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-card-name"]').text()).toBe('泠泠');
    expect(wrapper.get('[data-testid="agent-card-emoji"]').text()).toBe('🐷');
    expect(wrapper.get('[data-testid="agent-card-handle"]').text()).toBe('@shuna.rin_');
  });

  it('正職探員應顯示 FULL 章', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: baseAgent },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-card-fulltime"]').exists()).toBe(true);
  });

  it('現役探員不顯示 FULL 章', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: { ...baseAgent, isFullTime: false } },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-card-fulltime"]').exists()).toBe(false);
  });

  it('卒業探員顯示「卒業」章而非 FULL 章（卒業優先於正職）', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: { ...baseAgent, isFullTime: true, isGraduated: true } },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-card-graduated"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="agent-card-graduated"]').text()).toBe('卒業');
    expect(wrapper.find('[data-testid="agent-card-fulltime"]').exists()).toBe(false);
  });

  it('卒業探員照片加灰階濾鏡 class', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: { ...baseAgent, isFullTime: false, isGraduated: true } },
      global: { stubs },
    });

    const img = wrapper.get('[data-testid="agent-card-image"]');
    expect(img.classes()).toContain('grayscale-[60%]');
  });

  it('未提供 instagram 時不顯示 handle 區塊', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: { ...baseAgent, instagram: undefined } },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-card-handle"]').exists()).toBe(false);
  });

  /**
   * 照片掛在外部 host（其中 77 張在別家公司的 dev 環境 CDN）。host 一旦被清掉，
   * 沒有 fallback 的話整片圖鑑會塌成破圖框。
   */
  it('照片載入失敗時改渲染首字，不留破圖', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: baseAgent },
      global: { stubs },
    });

    await wrapper.get('[data-testid="agent-card-image"]').trigger('error');

    expect(wrapper.find('[data-testid="agent-card-image"]').exists()).toBe(false);
    expect(wrapper.get('[data-testid="agent-card-image-fallback"]').text()).toBe('泠');
  });

  it('沒有照片時同樣渲染首字替代', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: { ...baseAgent, picture: '' } },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-card-image-fallback"]').text()).toBe('泠');
  });
});
