import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AgentScheduleCard from '../../AgentScheduleCard.vue';
import type { AgentScheduleItem } from '~~/app/composables/useAgent';

const NuxtLinkStub = defineComponent({
  inheritAttrs: false,
  template: '<a v-bind="$attrs"><slot /></a>',
});

const stubs = {
  NuxtLink: NuxtLinkStub,
} as const;

const makeItem = (overrides: Partial<AgentScheduleItem> = {}): AgentScheduleItem => ({
  date: { datetime: '10月12日', backgroundColor: '', description: '' },
  dayShifts: [{ name: '泠泠', textColor: '' }],
  nightShifts: [],
  ...overrides,
});

describe('AgentScheduleCard', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date(2024, 9, 12));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('當天日期應渲染 TODAY 標籤並標記 data-today=true', async () => {
    const wrapper = await mountSuspended(AgentScheduleCard, {
      props: { schedule: makeItem() },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-schedule-row"]').attributes('data-today')).toBe(
      'true'
    );
    expect(wrapper.find('[data-testid="agent-schedule-today"]').exists()).toBe(true);
  });

  it('非今日不渲染 TODAY 標籤', async () => {
    const wrapper = await mountSuspended(AgentScheduleCard, {
      props: {
        schedule: makeItem({
          date: { datetime: '11月15日', backgroundColor: '', description: '' },
        }),
      },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-schedule-row"]').attributes('data-today')).toBe(
      'false'
    );
    expect(wrapper.find('[data-testid="agent-schedule-today"]').exists()).toBe(false);
  });

  it('有早班時渲染早班 badge,有晚班時渲染晚班 badge', async () => {
    const wrapper = await mountSuspended(AgentScheduleCard, {
      props: {
        schedule: makeItem({
          dayShifts: [{ name: '泠泠', textColor: '' }],
          nightShifts: [{ name: '泠泠', textColor: '' }],
        }),
      },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-schedule-badge-day"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="agent-schedule-badge-night"]').exists()).toBe(true);
  });

  it('僅有晚班時不渲染早班 badge', async () => {
    const wrapper = await mountSuspended(AgentScheduleCard, {
      props: {
        schedule: makeItem({
          dayShifts: [],
          nightShifts: [{ name: '泠泠', textColor: '' }],
        }),
      },
      global: { stubs },
    });

    expect(wrapper.find('[data-testid="agent-schedule-badge-day"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="agent-schedule-badge-night"]').exists()).toBe(true);
  });

  it('「當日全體」連結指向 /shifts?date=...', async () => {
    const wrapper = await mountSuspended(AgentScheduleCard, {
      props: {
        schedule: makeItem({
          date: { datetime: '11月20日', backgroundColor: '', description: '' },
        }),
      },
      global: { stubs },
    });

    expect(wrapper.get('[data-testid="agent-schedule-link"]').attributes('to')).toBe(
      '/shifts?date=11月20日'
    );
  });
});
