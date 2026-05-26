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

  // per-shift 渲染：每筆班次需獨立還原時段、顏色與代班 / 換班語意,
  // 不能用單一 boolean(hasDayShift / hasNightShift) 摺疊掉這些資訊。
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

  // 灰字＝今日不出勤（個人頁 bug 修正）：班表頁灰字探員 chip 對應「當天臨時
  // 不出勤」，個人頁原本完全沒有視覺差異，導致使用者誤以為當天會出勤。
  describe('今日不出勤（灰字）渲染', () => {
    it('早班灰字應改用 shift-icon-leave 並渲染「今日不出勤」標記', async () => {
      const wrapper = await mountSuspended(AgentScheduleCard, {
        props: {
          schedule: makeItem({
            dayShifts: [{ name: '千熊', textColor: '#cccccc' }],
            nightShifts: [],
          }),
        },
        global: { stubs },
      });

      const badge = wrapper.get('[data-testid="agent-schedule-badge-day"]');
      expect(badge.attributes('data-leave')).toBe('true');
      expect(badge.classes()).toContain('shift-icon-leave');
      expect(badge.classes()).not.toContain('shift-icon-day');

      const leave = wrapper.get('[data-testid="agent-schedule-leave-day"]');
      expect(leave.text()).toContain('今日不出勤');
    });

    it('晚班灰字 badge 不應套用時段色（iconColor 退回）', async () => {
      const wrapper = await mountSuspended(AgentScheduleCard, {
        props: {
          schedule: makeItem({
            dayShifts: [],
            nightShifts: [{ name: '千熊', textColor: '#999999' }],
          }),
        },
        global: { stubs },
      });

      const badge = wrapper.get('[data-testid="agent-schedule-badge-night"]');
      expect(badge.attributes('data-leave')).toBe('true');
      expect(badge.classes()).toContain('shift-icon-leave');
      // 灰字 badge 不應 inline 注入 color（避免被誤套成綠/橘）
      expect(badge.attributes('style') ?? '').not.toContain('#');
      expect(wrapper.find('[data-testid="agent-schedule-leave-night"]').exists()).toBe(true);
    });

    it('一般班次不渲染「今日不出勤」標記，data-leave=false', async () => {
      const wrapper = await mountSuspended(AgentScheduleCard, {
        props: {
          schedule: makeItem({
            dayShifts: [{ name: '泠泠', textColor: '' }],
            nightShifts: [],
          }),
        },
        global: { stubs },
      });

      const badge = wrapper.get('[data-testid="agent-schedule-badge-day"]');
      expect(badge.attributes('data-leave')).toBe('false');
      expect(badge.classes()).toContain('shift-icon-day');
      expect(wrapper.find('[data-testid="agent-schedule-leave-day"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="agent-schedule-leave-night"]').exists()).toBe(false);
    });

    // 早晚班的「今日不出勤」標記需以 -day / -night 拆 testid,
    // 否則同日雙灰字時 `wrapper.get(...)` 會拋「found multiple」。
    it('同日早晚班皆為灰字時,可分別以 -day / -night 取得兩個「今日不出勤」標記', async () => {
      const wrapper = await mountSuspended(AgentScheduleCard, {
        props: {
          schedule: makeItem({
            dayShifts: [{ name: '千熊', textColor: '#cccccc' }],
            nightShifts: [{ name: '千熊', textColor: '#999999' }],
          }),
        },
        global: { stubs },
      });

      const leaveDay = wrapper.get('[data-testid="agent-schedule-leave-day"]');
      const leaveNight = wrapper.get('[data-testid="agent-schedule-leave-night"]');
      expect(leaveDay.text()).toContain('今日不出勤');
      expect(leaveNight.text()).toContain('今日不出勤');
    });
  });
});
