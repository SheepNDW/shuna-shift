import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ShiftItem from '../../ShiftItem.vue';

const UIconStub = defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  template: '<i :data-name="name" v-bind="$attrs"><slot /></i>',
});

describe('ShiftItem', () => {
  it('渲染日班時應顯示班次資訊且不含代班文字', async () => {
    const wrapper = await mountSuspended(ShiftItem, {
      props: {
        shift: { name: '泠泠', textColor: '#000000' },
        type: 'day',
      },
      global: {
        stubs: {
          UIcon: UIconStub,
        },
      },
    });

    expect(wrapper.find('[data-name="i-heroicons-sun"]').exists()).toBe(true);
    expect(wrapper.get('p').text()).toBe('早班 13:30 ~ 17:30');
    expect(wrapper.text()).not.toContain('代班');
    expect(wrapper.text()).not.toContain('換班');
  });

  it('夜班顏色有對應時應套用顏色並顯示正確時間', async () => {
    const wrapper = await mountSuspended(ShiftItem, {
      props: {
        shift: { name: '米捲', textColor: '#93c47d' },
        type: 'night',
      },
      global: {
        stubs: {
          UIcon: UIconStub,
        },
      },
    });

    const icon = wrapper.get('[data-name="i-heroicons-moon"]');
    expect(icon.attributes('style')).toContain('color: #93c47d');
    const title = wrapper.get('p');
    expect(title.text()).toBe('晚班 15:00 ~ 19:30');
    expect(title.attributes('style')).toContain('color: #93c47d');
  });

  it('出現紅色文字時應視為代班並呈現原始探員資訊', async () => {
    const wrapper = await mountSuspended(ShiftItem, {
      props: {
        shift: { name: '泠泠(七尾)', textColor: '#ef4444' },
        type: 'night',
      },
      global: {
        stubs: {
          UIcon: UIconStub,
        },
      },
    });

    expect(wrapper.find('[data-name="i-heroicons-arrow-path"]').exists()).toBe(true);
    const info = wrapper.get('span.text-sm');
    expect(info.text()).toContain('代班');
    expect(info.text()).toContain('原: 七尾');
    expect(info.attributes('style')).toContain('color: #ef4444');
  });

  it('出現藍色文字時應視為換班並顯示對應圖示', async () => {
    const wrapper = await mountSuspended(ShiftItem, {
      props: {
        shift: { name: '泠泠(七尾)', textColor: '#3b82f6' },
        type: 'night',
      },
      global: {
        stubs: {
          UIcon: UIconStub,
        },
      },
    });

    expect(wrapper.find('[data-name="i-heroicons-arrow-path-rounded-square"]').exists()).toBe(true);
    const info = wrapper.get('span.text-sm');
    expect(info.text()).toContain('換班');
    expect(info.text()).toContain('原: 七尾');
    expect(info.attributes('style')).toContain('color: #3b82f6');
  });
});
