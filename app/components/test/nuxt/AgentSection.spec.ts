import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AgentSection from '../../AgentSection.vue';
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

const makeAgent = (overrides: Partial<Agent> = {}): Agent => ({
  id: 'rin',
  name: '泠泠',
  picture: 'https://example.com/rin.jpg',
  photos: [],
  ...overrides,
});

describe('AgentSection', () => {
  it('渲染 header(漢字 + label + desc)與 padStart 後的計數', async () => {
    const wrapper = await mountSuspended(AgentSection, {
      props: {
        kanji: '正',
        label: 'FULL-TIME · 正職探員',
        desc: '店內招牌・長期駐店',
        agents: [makeAgent(), makeAgent({ id: 'juano', name: '米捲' })],
      },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-section-label"]').text()).toBe(
      'FULL-TIME · 正職探員'
    );
    expect(wrapper.get('[data-testid="agent-section-desc"]').text()).toBe('店內招牌・長期駐店');
    expect(wrapper.get('[data-testid="agent-section-count"]').text()).toBe('02');
    expect(wrapper.text()).toContain('正');
  });

  it('每位探員渲染一張 AgentCard', async () => {
    const wrapper = await mountSuspended(AgentSection, {
      props: {
        kanji: '現',
        label: 'ACTIVE · 現役探員',
        desc: '輪班駐店探員',
        agents: [
          makeAgent({ id: 'a1', name: 'A' }),
          makeAgent({ id: 'a2', name: 'B' }),
          makeAgent({ id: 'a3', name: 'C' }),
        ],
      },
      global: { stubs },
    });

    expect(wrapper.findAll('[data-testid="agent-card"]')).toHaveLength(3);
  });

  it('agents 為空陣列時計數為 00 並顯示 EmptyState', async () => {
    const wrapper = await mountSuspended(AgentSection, {
      props: {
        kanji: '正',
        label: 'FULL-TIME',
        desc: '店內招牌',
        agents: [],
      },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-section-count"]').text()).toBe('00');
    expect(wrapper.findAll('[data-testid="agent-card"]')).toHaveLength(0);
    expect(wrapper.find('[data-testid="agent-section-empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="agent-section-grid"]').exists()).toBe(false);
  });
});
