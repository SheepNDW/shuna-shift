import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { defineComponent } from 'vue';
import AgentListCard from '../../AgentListCard.vue';

const UIconStub = defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  template: '<i :data-icon="name"><slot /></i>',
});

const NuxtLinkStub = defineComponent({
  template: '<a v-bind="$attrs"><slot /></a>',
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

describe('AgentListCard', () => {
  const stubs = {
    UIcon: UIconStub,
    NuxtLink: NuxtLinkStub,
    NuxtImg: NuxtImgStub,
  } as const;

  const baseAgent: Agent = {
    id: 'rin',
    name: '泠泠',
    picture: 'https://example.com/rin.jpg',
    photos: [],
    instagram: 'https://instagram.com/rin',
  };

  it('renders full-time agent styling', async () => {
    const wrapper = await mountSuspended(AgentListCard, {
      props: {
        agent: { ...baseAgent, isFullTime: true },
      },
      global: {
        stubs,
      },
    });

    expect(wrapper.find('[data-testid="agent-list-card"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="agent-card-link"]').attributes('to')).toBe('/agents/rin');
    expect(wrapper.find('[data-icon="i-heroicons-star-solid"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('泠泠');
  });

  it('renders part-time agent styling', async () => {
    const wrapper = await mountSuspended(AgentListCard, {
      props: {
        agent: { ...baseAgent, id: 'ruby', name: 'Ruby', isFullTime: false },
      },
      global: {
        stubs,
      },
    });

    expect(wrapper.find('[data-icon="i-heroicons-sparkles"]').exists()).toBe(true);
  });

  it('renders instagram link when available', async () => {
    const wrapper = await mountSuspended(AgentListCard, {
      props: {
        agent: { ...baseAgent, isFullTime: false },
      },
      global: {
        stubs,
      },
    });

    const instagramLink = wrapper.find('[data-testid="instagram-link"]');
    expect(instagramLink.exists()).toBe(true);
    expect(instagramLink.attributes('href')).toBe(baseAgent.instagram);
    expect(instagramLink.attributes('target')).toBe('_blank');
  });

  it('skips instagram link when url missing', async () => {
    const wrapper = await mountSuspended(AgentListCard, {
      props: {
        agent: { ...baseAgent, instagram: undefined, isFullTime: false },
      },
      global: {
        stubs,
      },
    });

    expect(wrapper.find('[data-testid="instagram-link"]').exists()).toBe(false);
  });
});
