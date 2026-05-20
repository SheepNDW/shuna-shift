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
  picture: 'https://example.com/rin.jpg',
  photos: [],
  instagram: 'https://www.instagram.com/shuna.rin_/',
  isFullTime: true,
  emoji: '🐷',
};

describe('AgentCard', () => {
  it('portrait variant 為預設,連結指向探員詳情頁', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: baseAgent },
      global: { stubs },
    });

    const root = wrapper.get('[data-testid="agent-card"]');
    expect(root.attributes('data-variant')).toBe('portrait');
    expect(root.attributes('to')).toBe('/agents/rin');
  });

  it('portrait variant 顯示名字、emoji 章與 IG handle', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: baseAgent, variant: 'portrait' },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-card-name"]').text()).toBe('泠泠');
    expect(wrapper.get('[data-testid="agent-card-emoji"]').text()).toBe('🐷');
    expect(wrapper.get('[data-testid="agent-card-handle"]').text()).toBe('@shuna.rin_');
  });

  it('正職探員應顯示 FULL 章', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: baseAgent, variant: 'portrait' },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-card-fulltime"]').exists()).toBe(true);
  });

  it('現役探員不顯示 FULL 章', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: {
        agent: { ...baseAgent, isFullTime: false },
        variant: 'portrait',
      },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-card-fulltime"]').exists()).toBe(false);
  });

  it('compact variant 渲染圓頭像簡版,不顯示 IG handle', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: baseAgent, variant: 'compact' },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-card"]').attributes('data-variant')).toBe('compact');
    expect(wrapper.get('[data-testid="agent-card-name"]').text()).toBe('泠泠');
    expect(wrapper.find('[data-testid="agent-card-handle"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="agent-card-emoji"]').exists()).toBe(false);
  });

  it('full variant 顯示 AGENT FILE 編號', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: { agent: baseAgent, variant: 'full', fileNumber: '003' },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-card"]').attributes('data-variant')).toBe('full');
    expect(wrapper.get('[data-testid="agent-card-file-number"]').text()).toBe(
      'AGENT FILE · 003'
    );
  });

  it('未提供 instagram 時不顯示 handle 區塊', async () => {
    const wrapper = await mountSuspended(AgentCard, {
      props: {
        agent: { ...baseAgent, instagram: undefined },
        variant: 'portrait',
      },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-card-handle"]').exists()).toBe(false);
  });
});
