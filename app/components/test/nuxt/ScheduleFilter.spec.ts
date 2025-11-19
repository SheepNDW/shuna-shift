import { describe, expect, it } from 'vitest';
import { defineComponent, ref } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ScheduleFilter from '../../ScheduleFilter.vue';

type AgentOption = { label: string; name: string };

const UIconStub = defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  template: '<i :data-name="name" v-bind="$attrs"><slot /></i>',
});

const USelectMenuStub = defineComponent({
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:modelValue'],
  template: '<div class="u-select-menu" v-bind="$attrs"><slot /></div>',
});

const UButtonStub = defineComponent({
  emits: ['click'],
  template:
    '<button type="button" v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
});

const UBadgeStub = defineComponent({
  template: '<span class="u-badge" v-bind="$attrs"><slot /></span>',
});

describe('ScheduleFilter', () => {
  const mountComponent = async (initialValue: AgentOption[] = []) => {
    const model = ref<AgentOption[]>([...initialValue]);
    const WrapperComponent = defineComponent({
      components: { ScheduleFilter },
      setup() {
        return { model };
      },
      template: '<ScheduleFilter v-model="model" />',
    });

    const wrapper = await mountSuspended(WrapperComponent, {
      global: {
        stubs: {
          UIcon: UIconStub,
          USelectMenu: USelectMenuStub,
          UButton: UButtonStub,
          UBadge: UBadgeStub,
        },
      },
    });

    return { wrapper: wrapper as typeof wrapper, model };
  };

  it('會為每位選擇探員顯示徽章並可清除篩選', async () => {
    const selectedAgents = [
      { label: '泠泠', name: 'rin' },
      { label: '米捲', name: 'juano' },
    ];
    const { wrapper, model } = await mountComponent(selectedAgents);

    expect(wrapper.findAll('[data-testid="agent-badge"]').length).toBe(2);

    await wrapper.get('[data-testid="clear-filter-btn"]').trigger('click');

    expect(model.value).toEqual([]);
  });

  it('點擊徽章的移除按鈕時會移除單一探員', async () => {
    const selectedAgents = [
      { label: '泠泠', name: 'rin' },
      { label: '米捲', name: 'juano' },
    ];
    const { wrapper, model } = await mountComponent(selectedAgents);

    const removeButtons = wrapper.findAll('[data-testid="remove-agent-btn"]');
    expect(removeButtons.length).toBeGreaterThan(0);
    await removeButtons[0]!.trigger('click');

    expect(model.value).toEqual([{ label: '米捲', name: 'juano' }]);
  });
});
