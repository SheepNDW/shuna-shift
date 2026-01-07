import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AgentProfile from '../../AgentProfile.vue';

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

const UCardStub = defineComponent({
  template: '<div><div><slot name="header" /></div><div><slot /></div></div>',
});

const UCarouselStub = defineComponent({
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  template:
    '<div><div v-for="(item, index) in items" :key="index"><slot :item="item" :index="index" /></div></div>',
});

describe('AgentProfile', () => {
  const stubs = {
    UIcon: UIconStub,
    NuxtImg: NuxtImgStub,
    UCard: UCardStub,
    UCarousel: UCarouselStub,
  } as const;

  const baseAgent: Agent = {
    id: 'rin',
    name: '泠泠',
    picture: 'https://example.com/rin.jpg',
    photos: [],
    instagram: 'https://instagram.com/rin',
    isFullTime: true,
  };

  it('photos 為空陣列時不顯示照片牆', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: {
        agentInfo: { ...baseAgent, photos: [] },
      },
      global: {
        stubs,
      },
    });

    expect(wrapper.find('[data-testid="agent-photo-section"]').exists()).toBe(false);
  });

  it('photos 有值時顯示輪播並渲染對應圖片數量', async () => {
    const wrapper = await mountSuspended(AgentProfile, {
      props: {
        agentInfo: {
          ...baseAgent,
          photos: ['https://example.com/photo-1.jpg', 'https://example.com/photo-2.jpg'],
        },
      },
      global: {
        stubs,
      },
    });

    const section = wrapper.find('[data-testid="agent-photo-section"]');
    expect(section.exists()).toBe(true);
    expect(section.findAll('[data-testid="agent-photo-image"]').length).toBe(2);
  });
});
