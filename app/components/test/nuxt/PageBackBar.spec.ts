import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import PageBackBar from '../../PageBackBar.vue';

const NuxtLinkStub = defineComponent({
  inheritAttrs: false,
  template: '<a v-bind="$attrs"><slot /></a>',
});

const stubs = {
  NuxtLink: NuxtLinkStub,
} as const;

describe('PageBackBar', () => {
  it('渲染回上層連結與分類 stamp', async () => {
    const wrapper = await mountSuspended(PageBackBar, {
      props: { to: '/agents', label: '探員圖鑑', stamp: 'FULL-TIME · 正職' },
      global: { stubs },
    });

    const link = wrapper.get('[data-testid="page-back-bar-link"]');
    expect(link.attributes('to')).toBe('/agents');
    expect(link.text()).toBe('← 探員圖鑑');
    expect(wrapper.get('[data-testid="page-back-bar-stamp"]').text()).toBe('FULL-TIME · 正職');
  });

  it('未傳 stamp 時不渲染右側標籤', async () => {
    const wrapper = await mountSuspended(PageBackBar, {
      props: { to: '/agents', label: '探員圖鑑' },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="page-back-bar-stamp"]').exists()).toBe(false);
  });
});
