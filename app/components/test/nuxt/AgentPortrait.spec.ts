import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AgentPortrait from '../../AgentPortrait.vue';

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

const globalStubs = {
  NuxtLink: NuxtLinkStub,
  NuxtImg: NuxtImgStub,
} as const;

describe('AgentPortrait', () => {
  it('已知探員應顯示名字、照片與探員頁連結', async () => {
    const wrapper = await mountSuspended(AgentPortrait, {
      props: { name: '泠泠', textColor: '#123456' },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="agent-name"]').text()).toBe('泠泠');
    expect(wrapper.find('a').attributes('to')).toBe('/agents/rin');
    expect(wrapper.find('img').attributes('alt')).toBe('泠泠 的照片');
  });

  it('應以 --agent-color 變數帶入代表色', async () => {
    const wrapper = await mountSuspended(AgentPortrait, {
      props: { name: '泠泠', textColor: '#123456' },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="agent-portrait"]').attributes('style')).toContain(
      '--agent-color: #123456'
    );
  });

  it('正職探員應顯示對應 emoji', async () => {
    const wrapper = await mountSuspended(AgentPortrait, {
      props: { name: '泠泠', textColor: '' },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="agent-emoji"]').text()).toBe('🐷');
  });

  it('帶括號的替班名稱應完整顯示，並連回原探員', async () => {
    const wrapper = await mountSuspended(AgentPortrait, {
      props: { name: '泠泠(七尾)', textColor: '' },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="agent-name"]').text()).toBe('泠泠(七尾)');
    expect(wrapper.find('a').attributes('to')).toBe('/agents/rin');
  });

  it('未知探員應以非連結容器渲染', async () => {
    const wrapper = await mountSuspended(AgentPortrait, {
      props: { name: '查無此人', textColor: '' },
      global: { stubs: globalStubs },
    });

    expect(wrapper.find('a').exists()).toBe(false);
    expect(wrapper.get('[data-testid="agent-name"]').text()).toBe('查無此人');
  });
});
