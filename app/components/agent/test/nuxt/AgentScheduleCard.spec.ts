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

  // 回歸測試:per-shift 渲染需還原夜班時段、顏色與代班 / 換班語意
  // (review H1 — 舊版用 hasDayShift / hasNightShift 兩個 boolean 把這些資訊丟掉了)
  describe('per-shift 語意', () => {
    it('早班 badge 顯示固定時段 13:30 ~ 17:30', async () => {
      const wrapper = await mountSuspended(AgentScheduleCard, {
        props: {
          schedule: makeItem({
            dayShifts: [{ name: '泠泠', textColor: '' }],
            nightShifts: [],
          }),
        },
        global: { stubs },
      });

      expect(wrapper.get('[data-testid="agent-schedule-badge-day"]').text()).toContain(
        '13:30 ~ 17:30'
      );
    });

    it('綠晚班 (#93c47d) 還原時段 15:00 ~ 19:30 並套色', async () => {
      const wrapper = await mountSuspended(AgentScheduleCard, {
        props: {
          schedule: makeItem({
            dayShifts: [],
            nightShifts: [{ name: '泠泠', textColor: '#93c47d' }],
          }),
        },
        global: { stubs },
      });

      const badge = wrapper.get('[data-testid="agent-schedule-badge-night"]');
      expect(badge.text()).toContain('15:00 ~ 19:30');
      expect(badge.attributes('style')).toContain('#93c47d');
    });

    it('相近綠晚班 (#70ad47,色卡填錯) 仍還原 15:00 ~ 19:30 並套 canonical 綠', async () => {
      const wrapper = await mountSuspended(AgentScheduleCard, {
        props: {
          schedule: makeItem({
            dayShifts: [],
            nightShifts: [{ name: '泠泠', textColor: '#70ad47' }],
          }),
        },
        global: { stubs },
      });

      const badge = wrapper.get('[data-testid="agent-schedule-badge-night"]');
      expect(badge.text()).toContain('15:00 ~ 19:30');
      expect(badge.attributes('style')).toContain('#93c47d');
    });

    it('橘晚班 (#ff9900) 還原時段 16:00 ~ 21:30 並套色', async () => {
      const wrapper = await mountSuspended(AgentScheduleCard, {
        props: {
          schedule: makeItem({
            dayShifts: [],
            nightShifts: [{ name: '泠泠', textColor: '#ff9900' }],
          }),
        },
        global: { stubs },
      });

      const badge = wrapper.get('[data-testid="agent-schedule-badge-night"]');
      expect(badge.text()).toContain('16:00 ~ 21:30');
      expect(badge.attributes('style')).toContain('#ff9900');
    });

    it('預設晚班 (textColor 為空) 顯示 17:30 ~ 21:30 且不套色', async () => {
      const wrapper = await mountSuspended(AgentScheduleCard, {
        props: {
          schedule: makeItem({
            dayShifts: [],
            nightShifts: [{ name: '泠泠', textColor: '' }],
          }),
        },
        global: { stubs },
      });

      const badge = wrapper.get('[data-testid="agent-schedule-badge-night"]');
      expect(badge.text()).toContain('17:30 ~ 21:30');
      // iconColor 為空字串時不應 inline style 注入 color
      expect(badge.attributes('style') ?? '').not.toContain('#');
    });

    it('代班 (#ff0000) 顯示「代班」標記與原班探員', async () => {
      const wrapper = await mountSuspended(AgentScheduleCard, {
        props: {
          schedule: makeItem({
            dayShifts: [{ name: '小楓(泠泠)', textColor: '#ff0000' }],
            nightShifts: [],
          }),
        },
        global: { stubs },
      });

      const tag = wrapper.get('[data-testid="agent-schedule-substitute"]');
      expect(tag.attributes('data-substitute-type')).toBe('substitute');
      expect(tag.text()).toContain('代班');
      expect(tag.text()).toContain('(原: 泠泠)');
    });

    it('換班 (#1155cc) 顯示「換班」標記', async () => {
      const wrapper = await mountSuspended(AgentScheduleCard, {
        props: {
          schedule: makeItem({
            dayShifts: [],
            nightShifts: [{ name: '小楓(Iroha)', textColor: '#1155cc' }],
          }),
        },
        global: { stubs },
      });

      const tag = wrapper.get('[data-testid="agent-schedule-substitute"]');
      expect(tag.attributes('data-substitute-type')).toBe('exchange');
      expect(tag.text()).toContain('換班');
      expect(tag.text()).toContain('(原: Iroha)');
    });

    it('一般班次不渲染代班 / 換班標記', async () => {
      const wrapper = await mountSuspended(AgentScheduleCard, {
        props: {
          schedule: makeItem({
            dayShifts: [{ name: '泠泠', textColor: '' }],
            nightShifts: [{ name: '泠泠', textColor: '#93c47d' }],
          }),
        },
        global: { stubs },
      });

      expect(wrapper.find('[data-testid="agent-schedule-substitute"]').exists()).toBe(false);
    });
  });
});
