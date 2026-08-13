import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import UpcomingCard from '../../UpcomingCard.vue';

const NuxtLinkStub = defineComponent({
  inheritAttrs: false,
  template: '<a v-bind="$attrs"><slot /></a>',
});

const ShiftGlyphStub = defineComponent({
  props: { type: { type: String, required: true } },
  template: '<i data-testid="shift-glyph" :data-type="type" />',
});

const globalStubs = {
  NuxtLink: NuxtLinkStub,
  ShiftGlyph: ShiftGlyphStub,
} as const;

const scheduleMock: ShiftSchedule = {
  date: {
    iso: '2024-10-12', datetime: '10月12日',
    backgroundColor: '#b6d7a8',
    description: '特別營業',
  },
  day: [
    { name: '泠泠', textColor: '' },
    { name: '七尾', textColor: '#ff9900' },
    { name: '米捲', textColor: '#93c47d' },
  ],
  night: [{ name: '小花', textColor: '#ff0000' }],
};

describe('UpcomingCard', () => {
  beforeEach(() => {
    // 固定時鐘，使「今天」相關的呈現穩定；
    // getWeekdayLabel 已改吃完整 ISO，星期本身不受「今天」影響
    // 絕對時刻（台北正午）；本地建構式會跟著 runner 時區漂移，見 app/utils/date.ts
    vi.setSystemTime(new Date('2024-10-12T12:00:00+08:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('應顯示月日與星期', async () => {
    const wrapper = await mountSuspended(UpcomingCard, {
      props: { schedule: scheduleMock },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="upcoming-md"]').text()).toBe('10/12');
    // 2024/10/12 為星期六
    expect(wrapper.get('[data-testid="upcoming-dow"]').text()).toBe('星期六');
  });

  it('應顯示早 / 晚班人數', async () => {
    const wrapper = await mountSuspended(UpcomingCard, {
      props: { schedule: scheduleMock },
      global: { stubs: globalStubs },
    });

    const counts = wrapper.findAll('[data-testid="upcoming-num"]');
    expect(counts[0]?.text()).toBe('03');
    expect(counts[1]?.text()).toBe('01');
  });

  it('探員超過兩位時僅顯示前兩位並加省略號', async () => {
    const wrapper = await mountSuspended(UpcomingCard, {
      props: { schedule: scheduleMock },
      global: { stubs: globalStubs },
    });

    const names = wrapper.findAll('[data-testid="upcoming-names"]');
    expect(names[0]?.text()).toBe('泠泠、七尾…');
    expect(names[1]?.text()).toBe('小花');
  });

  it('有特殊日說明時應顯示備註', async () => {
    const wrapper = await mountSuspended(UpcomingCard, {
      props: { schedule: scheduleMock },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="upcoming-note"]').text()).toContain('特別營業');
  });

  it('無排班的班別應顯示破折號', async () => {
    const wrapper = await mountSuspended(UpcomingCard, {
      props: {
        schedule: { ...scheduleMock, night: [] },
      },
      global: { stubs: globalStubs },
    });

    const names = wrapper.findAll('[data-testid="upcoming-names"]');
    expect(names[1]?.text()).toBe('—');
  });

  it('應連結至完整班表頁', async () => {
    const wrapper = await mountSuspended(UpcomingCard, {
      props: { schedule: scheduleMock },
      global: { stubs: globalStubs },
    });

    expect(wrapper.find('a').attributes('to')).toBe('/shifts');
  });

  it('店休日應顯示「休」而非早晚班人數', async () => {
    const wrapper = await mountSuspended(UpcomingCard, {
      props: {
        schedule: {
          date: { iso: '2024-10-13', datetime: '10月13日', backgroundColor: '#999999', description: '' },
          day: [],
          night: [],
        },
      },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="upcoming-closed"]').text()).toContain('休');
    expect(wrapper.findAll('[data-testid="upcoming-num"]')).toHaveLength(0);
  });
});
