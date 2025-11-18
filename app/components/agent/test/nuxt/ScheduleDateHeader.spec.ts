import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ScheduleDateHeader from '../../ScheduleDateHeader.vue';
import { DATE_COLOR_MAP } from '../../../../utils/colors';

const UIconStub = defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  template: '<i :data-name="name" v-bind="$attrs"><slot /></i>',
});

describe('ScheduleDateHeader', () => {
  it('當背景色符合特殊事件時應顯示對應圖示與標籤', async () => {
    const wrapper = await mountSuspended(ScheduleDateHeader, {
      props: {
        date: {
          datetime: '10月21日',
          backgroundColor: DATE_COLOR_MAP.SPECIAL_DAY,
          description: '特別活動',
        },
      },
      global: {
        stubs: {
          UIcon: UIconStub,
        },
      },
    });

    expect(wrapper.find('[data-name="i-heroicons-star"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('一日限定');

    const title = wrapper.get('h3');
    expect(title.attributes('style')).toContain(DATE_COLOR_MAP.SPECIAL_DAY);
    const description = wrapper.get('p');
    expect(description.attributes('style')).toContain(DATE_COLOR_MAP.SPECIAL_DAY);
  });

  it('當背景色無事件對應時應套用預設樣式', async () => {
    const wrapper = await mountSuspended(ScheduleDateHeader, {
      props: {
        date: {
          datetime: '10月22日',
          backgroundColor: '#222222',
          description: '一般出勤',
        },
      },
      global: {
        stubs: {
          UIcon: UIconStub,
        },
      },
    });

    expect(wrapper.find('[data-name="i-heroicons-star"]').exists()).toBe(false);
    const title = wrapper.get('h3');
    expect(title.classes()).toContain('text-gray-800');
    expect(title.attributes('style') ?? '').not.toContain('color:');
    const description = wrapper.get('p');
    expect(description.classes()).toContain('text-gray-600');
  });

  it('描述文字為空時應省略描述段落', async () => {
    const wrapper = await mountSuspended(ScheduleDateHeader, {
      props: {
        date: {
          datetime: '10月23日',
          backgroundColor: '#222222',
          description: '',
        },
      },
      global: {
        stubs: {
          UIcon: UIconStub,
        },
      },
    });

    expect(wrapper.find('p').exists()).toBe(false);
  });
});
