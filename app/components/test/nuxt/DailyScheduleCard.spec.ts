import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DailyScheduleCard from '../../DailyScheduleCard.vue';

const scheduleMock: ShiftSchedule = {
  date: {
    datetime: '10月12日',
    backgroundColor: '#b6d7a8',
    description: '特別營業',
  },
  day: [
    { name: '泠泠', textColor: '' },
    { name: '七尾', textColor: '#ff9900' },
  ],
  night: [{ name: '米捲', textColor: '#93c47d' }],
};

const ShiftCardStub = defineComponent({
  props: {
    shiftType: {
      type: String,
      required: true,
    },
    agents: {
      type: Array,
      default: () => [],
    },
    highlightedAgents: {
      type: Set,
      default: undefined,
    },
  },
  template:
    '<div data-testid="shift-card" :data-highlighted="highlightedAgents ? Array.from(highlightedAgents).join(\',\') : \'\'"><span>{{ shiftType }}</span><slot>{{ agents.length }}</slot></div>',
});

const IconStub = defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  template: '<i :data-name="name"><slot /></i>',
});

describe('DailyScheduleCard', () => {
  it('應顯示日期資訊與描述', async () => {
    const wrapper = await mountSuspended(DailyScheduleCard, {
      props: {
        schedule: scheduleMock,
      },
      global: {
        stubs: {
          ShiftCard: ShiftCardStub,
          UIcon: IconStub,
        },
      },
    });

    expect(wrapper.find('[data-name="i-heroicons-calendar-days"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('10月12日');
    expect(wrapper.text()).toContain('特別營業');

    const container = wrapper.find('div.inline-block');
    expect(container.attributes('style')).toContain('background-color: #b6d7a8');
  });

  it('當沒有描述時不顯示描述文字', async () => {
    const wrapper = await mountSuspended(DailyScheduleCard, {
      props: {
        schedule: {
          ...scheduleMock,
          date: {
            ...scheduleMock.date,
            description: '',
          },
        },
      },
      global: {
        stubs: {
          ShiftCard: ShiftCardStub,
          UIcon: IconStub,
        },
      },
    });

    expect(wrapper.text()).not.toContain('特別營業');
  });

  it('應將日班與晚班資料傳遞給 ShiftCard', async () => {
    const wrapper = await mountSuspended(DailyScheduleCard, {
      props: {
        schedule: scheduleMock,
      },
      global: {
        stubs: {
          ShiftCard: ShiftCardStub,
          UIcon: IconStub,
        },
      },
    });

    const shiftCards = wrapper.findAll('[data-testid="shift-card"]');
    expect(shiftCards).toHaveLength(2);
    expect(shiftCards[0]?.text()).toContain('day');
    expect(shiftCards[0]?.text()).toContain('2');
    expect(shiftCards[1]?.text()).toContain('night');
    expect(shiftCards[1]?.text()).toContain('1');
  });

  it('應將 highlightedAgents 傳遞給 ShiftCard', async () => {
    // 選擇早班和晚班都有的探員組合
    const highlightedAgents = new Set(['泠泠', '米捲']);

    const wrapper = await mountSuspended(DailyScheduleCard, {
      props: {
        schedule: scheduleMock,
        highlightedAgents,
      },
      global: {
        stubs: {
          ShiftCard: ShiftCardStub,
          UIcon: IconStub,
        },
      },
    });

    const shiftCards = wrapper.findAll('[data-testid="shift-card"]');
    expect(shiftCards).toHaveLength(2);
    expect(shiftCards[0]?.attributes('data-highlighted')).toContain('泠泠');
    expect(shiftCards[1]?.attributes('data-highlighted')).toContain('米捲');
  });

  it('當高亮探員只有早班時，只顯示早班', async () => {
    const highlightedAgents = new Set(['泠泠']);

    const wrapper = await mountSuspended(DailyScheduleCard, {
      props: {
        schedule: scheduleMock,
        highlightedAgents,
      },
      global: {
        stubs: {
          ShiftCard: ShiftCardStub,
          UIcon: IconStub,
        },
      },
    });

    const shiftCards = wrapper.findAll('[data-testid="shift-card"]');
    expect(shiftCards).toHaveLength(1);
    expect(shiftCards[0]?.text()).toContain('day');
  });

  it('當高亮探員只有晚班時，只顯示晚班', async () => {
    const highlightedAgents = new Set(['米捲']);

    const wrapper = await mountSuspended(DailyScheduleCard, {
      props: {
        schedule: scheduleMock,
        highlightedAgents,
      },
      global: {
        stubs: {
          ShiftCard: ShiftCardStub,
          UIcon: IconStub,
        },
      },
    });

    const shiftCards = wrapper.findAll('[data-testid="shift-card"]');
    expect(shiftCards).toHaveLength(1);
    expect(shiftCards[0]?.text()).toContain('night');
  });

  it('當沒有 highlightedAgents 時，ShiftCard 不應收到高亮資訊', async () => {
    const wrapper = await mountSuspended(DailyScheduleCard, {
      props: {
        schedule: scheduleMock,
      },
      global: {
        stubs: {
          ShiftCard: ShiftCardStub,
          UIcon: IconStub,
        },
      },
    });

    const shiftCards = wrapper.findAll('[data-testid="shift-card"]');
    expect(shiftCards[0]?.attributes('data-highlighted')).toBe('');
    expect(shiftCards[1]?.attributes('data-highlighted')).toBe('');
  });
});
