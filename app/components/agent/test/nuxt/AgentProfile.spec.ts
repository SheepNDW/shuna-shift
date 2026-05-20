import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AgentProfile from '../../AgentProfile.vue';
import type { Agent } from '~~/shared/types';

const UIconStub = defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  template: '<i :data-icon="name" v-bind="$attrs"><slot /></i>',
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
  template: '<img :src="src" :alt="alt" v-bind="$attrs" />',
});

const AgentPhotoCarouselStub = defineComponent({
  props: {
    photos: {
      type: Array,
      default: () => [],
    },
    agentName: {
      type: String,
      default: '',
    },
  },
  template:
    '<div data-testid="agent-photo-carousel"><div v-for="(p, i) in photos" :key="i" data-testid="agent-photo-image" /></div>',
});

const baseAgent: Agent = {
  id: 'rin',
  name: '泠泠',
  picture: 'https://example.com/rin.jpg',
  photos: [],
  instagram: 'https://www.instagram.com/shuna.rin_/',
  isFullTime: true,
  emoji: '🐷',
};

const stats = { dayCount: 3, nightCount: 5, total: 8 };

describe('AgentProfile', () => {
  const stubs = {
    UIcon: UIconStub,
    NuxtImg: NuxtImgStub,
    AgentPhotoCarousel: AgentPhotoCarouselStub,
  } as const;

  it('顯示 AGENT FILE 編號與探員名字', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: { agentInfo: baseAgent, fileNumber: '003', stats },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-profile-file-number"]').text()).toBe(
      'AGENT FILE · No. 003'
    );
    expect(wrapper.get('[data-testid="agent-profile-name"]').text()).toContain('泠泠');
  });

  it('近三個月日 / 夜 / 總三格統計均以 padStart 顯示', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: {
        agentInfo: baseAgent,
        fileNumber: '003',
        stats: { dayCount: 1, nightCount: 9, total: 10 },
      },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-profile-stat-day"]').text()).toBe('01');
    expect(wrapper.get('[data-testid="agent-profile-stat-night"]').text()).toBe('09');
    expect(wrapper.get('[data-testid="agent-profile-stat-total"]').text()).toBe('10');
  });

  it('正職探員分類 chip 顯示「正職探員」', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: { agentInfo: baseAgent, fileNumber: '001', stats },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-profile-status"]').text()).toContain('正職探員');
  });

  it('現役探員分類 chip 顯示「現役探員」', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: {
        agentInfo: { ...baseAgent, isFullTime: false },
        fileNumber: '012',
        stats,
      },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-profile-status"]').text()).toContain('現役探員');
  });

  it('提供 instagram 時渲染 IG chip 並帶 handle', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: { agentInfo: baseAgent, fileNumber: '003', stats },
      global: { stubs },
    });

    const ig = wrapper.get('[data-testid="agent-profile-instagram"]');
    expect(ig.attributes('href')).toBe(baseAgent.instagram);
    expect(ig.text()).toContain('@shuna.rin_');
  });

  it('未提供 instagram 時不渲染 IG chip', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: {
        agentInfo: { ...baseAgent, instagram: undefined },
        fileNumber: '003',
        stats,
      },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-profile-instagram"]').exists()).toBe(false);
  });

  it('photos 為空陣列時不顯示照片區', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: {
        agentInfo: { ...baseAgent, photos: [] },
        fileNumber: '003',
        stats,
      },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-photo-section"]').exists()).toBe(false);
  });

  it('photos 有值時顯示照片區並渲染對應數量的圖片', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: {
        agentInfo: {
          ...baseAgent,
          photos: ['https://example.com/photo-1.jpg', 'https://example.com/photo-2.jpg'],
        },
        fileNumber: '003',
        stats,
      },
      global: { stubs },
    });

    const section = wrapper.find('[data-testid="agent-photo-section"]');
    expect(section.exists()).toBe(true);
    expect(section.findAll('[data-testid="agent-photo-image"]').length).toBe(2);
  });
});
