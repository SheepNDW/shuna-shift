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
      props: { agent: baseAgent, fileNumber: '003', stats },
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
        agent: baseAgent,
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
      props: { agent: baseAgent, fileNumber: '001', stats },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-profile-status"]').text()).toContain('正職探員');
  });

  it('現役探員分類 chip 顯示「現役探員」', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: {
        agent: { ...baseAgent, isFullTime: false },
        fileNumber: '012',
        stats,
      },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-profile-status"]').text()).toContain('現役探員');
  });

  it('卒業探員分類 chip 顯示「卒業探員」(卒業優先於正職)且渲染 GRADUATED 章', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: {
        agent: { ...baseAgent, isFullTime: true, isGraduated: true },
        fileNumber: '005',
        stats,
      },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-profile-status"]').text()).toContain('卒業探員');
    expect(wrapper.find('[data-testid="agent-profile-graduated"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="agent-profile-graduated"]').text()).toBe('GRADUATED · 卒業');
  });

  it('非卒業探員不渲染 GRADUATED 章', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: { agent: baseAgent, fileNumber: '003', stats },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-profile-graduated"]').exists()).toBe(false);
  });

  it('機關檔案資料列:有任一欄位即渲染整塊,生日加裝飾留白', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: {
        agent: {
          ...baseAgent,
          themeColor: '群青 ｸﾞﾝｼﾞｮｳ',
          birthday: '02.20',
          skills: ['找東西', '綁蝴蝶結'],
          hobbies: ['去圖書館', '看小豬直播'],
        },
        fileNumber: '003',
        stats,
      },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-profile-dossier"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="agent-profile-dossier-color"]').text()).toBe('群青 ｸﾞﾝｼﾞｮｳ');
    expect(wrapper.get('[data-testid="agent-profile-dossier-birthday"]').text()).toBe('02 . 20');
    expect(wrapper.get('[data-testid="agent-profile-dossier-skills"]').text()).toBe(
      '找東西 · 綁蝴蝶結'
    );
    expect(wrapper.get('[data-testid="agent-profile-dossier-hobbies"]').text()).toBe(
      '去圖書館 · 看小豬直播'
    );
  });

  it('機關檔案缺欄位時對應列不渲染,其他列照舊', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: {
        agent: { ...baseAgent, themeColor: '群青 ｸﾞﾝｼﾞｮｳ' },
        fileNumber: '003',
        stats,
      },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-profile-dossier"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="agent-profile-dossier-color"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="agent-profile-dossier-birthday"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="agent-profile-dossier-skills"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="agent-profile-dossier-hobbies"]').exists()).toBe(false);
  });

  it('機關檔案四欄位全空時整塊不渲染', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: { agent: baseAgent, fileNumber: '003', stats },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-profile-dossier"]').exists()).toBe(false);
  });

  it('提供 quote 時渲染 quote banner 並以「」包覆,支援多行 pre-line', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: {
        agent: { ...baseAgent, quote: '前輩\n蹲下好不好' },
        fileNumber: '003',
        stats,
      },
      global: { stubs },
    });

    const quoteBanner = wrapper.find('[data-testid="agent-profile-quote"]');
    expect(quoteBanner.exists()).toBe(true);
    const quoteText = wrapper.get('[data-testid="agent-profile-quote-text"]');
    expect(quoteText.text()).toBe('「前輩\n蹲下好不好」');
    expect(quoteText.classes()).toContain('whitespace-pre-line');
  });

  it('未提供 quote 時不渲染 quote banner', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: { agent: baseAgent, fileNumber: '003', stats },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-profile-quote"]').exists()).toBe(false);
  });

  it('提供 instagram 時渲染 IG chip 並帶 handle', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: { agent: baseAgent, fileNumber: '003', stats },
      global: { stubs },
    });

    const ig = wrapper.get('[data-testid="agent-profile-instagram"]');
    expect(ig.attributes('href')).toBe(baseAgent.instagram);
    expect(ig.text()).toContain('@shuna.rin_');
  });

  it('未提供 instagram 時不渲染 IG chip', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: {
        agent: { ...baseAgent, instagram: undefined },
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
        agent: { ...baseAgent, photos: [] },
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
        agent: {
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

  // review M4:fetch 失敗時上游會把三格 stats 全傳 null,UI 必須顯示「—」
  // 而非把錯誤偽裝成「真的零班(00 / 00 / 00)」
  it('stats 為 null 時三格統計顯示「—」骨架,不顯示 00', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: {
        agent: baseAgent,
        fileNumber: '003',
        stats: { dayCount: null, nightCount: null, total: null },
      },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-profile-stat-day"]').text()).toBe('—');
    expect(wrapper.get('[data-testid="agent-profile-stat-night"]').text()).toBe('—');
    expect(wrapper.get('[data-testid="agent-profile-stat-total"]').text()).toBe('—');
  });
});
