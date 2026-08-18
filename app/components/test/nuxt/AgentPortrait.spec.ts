import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AgentPortrait from '../../AgentPortrait.vue';

// 僅 stub NuxtImg；NuxtLink 維持真實元件,以驗證實際渲染出可導航的 <a>。
const NuxtImgStub = defineComponent({
  props: {
    src: { type: String, default: '' },
    alt: { type: String, default: '' },
  },
  template: '<img :src="src" :alt="alt" />',
});

const globalStubs = { NuxtImg: NuxtImgStub } as const;

describe('AgentPortrait', () => {
  it('已知探員應顯示名字、照片與真實 <a> 探員頁連結', async () => {
    const wrapper = await mountSuspended(AgentPortrait, {
      props: { name: '泠泠', textColor: '#123456' },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="agent-name"]').text()).toBe('泠泠');
    const root = wrapper.get('[data-testid="agent-portrait"]');
    expect(root.element.tagName).toBe('A');
    expect(root.attributes('href')).toBe('/agents/rin');
    expect(wrapper.find('img').attributes('alt')).toBe('泠泠 的照片');
  });

  // 尺寸必須跟著 size 走：寫死會讓自訂 size 的呼叫端下載到錯誤解析度的圖，
  // 完全不給則會被 @nuxt/image 退回 screens 最大值。
  it('照片尺寸跟隨 size prop', async () => {
    const wrapper = await mountSuspended(AgentPortrait, {
      props: { name: '泠泠' },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('img').attributes('width')).toBe('88');
    expect(wrapper.get('img').attributes('height')).toBe('88');

    // 自訂值取 240（image.screens 已註冊的寬度）。未註冊的值雖然也驗證得了綁定，
    // 但正式站會被向上取整成別的尺寸，等於在測試裡示範一個危險用法。
    const enlarged = await mountSuspended(AgentPortrait, {
      props: { name: '泠泠', size: 240 },
      global: { stubs: globalStubs },
    });

    expect(enlarged.get('img').attributes('width')).toBe('240');
    expect(enlarged.get('img').attributes('height')).toBe('240');
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
    expect(wrapper.get('[data-testid="agent-portrait"]').attributes('href')).toBe('/agents/rin');
  });

  it('未知探員應以非連結容器渲染', async () => {
    const wrapper = await mountSuspended(AgentPortrait, {
      props: { name: '查無此人', textColor: '' },
      global: { stubs: globalStubs },
    });

    expect(wrapper.find('a').exists()).toBe(false);
    expect(wrapper.get('[data-testid="agent-portrait"]').element.tagName).toBe('DIV');
    expect(wrapper.get('[data-testid="agent-name"]').text()).toBe('查無此人');
  });

  /**
   * 照片掛在外部 host（其中 77 張在別家公司的 dev 環境 CDN），host 隨時可能不可用。
   * 首頁的今日班表整排都是這個元件，沒有 fallback 就會整排塌成破圖框。
   */
  it('照片載入失敗時退回首字，與「查無照片」走同一條 fallback', async () => {
    const wrapper = await mountSuspended(AgentPortrait, {
      props: { name: '泠泠', textColor: '' },
      global: { stubs: globalStubs },
    });

    await wrapper.get('img').trigger('error');

    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.text()).toContain('泠');
  });
});
