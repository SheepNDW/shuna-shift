import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DailyScheduleCard from '../../DailyScheduleCard.vue';

const DateTagStub = defineComponent({
  props: {
    datetime: { type: String, required: true },
    isToday: { type: Boolean, default: false },
    description: { type: String, default: '' },
  },
  template:
    '<div data-testid="date-tag" :data-datetime="datetime" :data-today="isToday">{{ description }}</div>',
});

const ShiftRowStub = defineComponent({
  props: {
    type: { type: String, required: true },
    agents: { type: Array, default: () => [] },
    highlightedAgents: { type: Set, default: undefined },
  },
  template:
    '<div data-testid="shift-row" :data-type="type" :data-count="agents.length" :data-highlighted="highlightedAgents ? Array.from(highlightedAgents).join(\',\') : \'\'" />',
});

const globalStubs = {
  DateTag: DateTagStub,
  ShiftRow: ShiftRowStub,
} as const;

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

describe('DailyScheduleCard', () => {
  beforeEach(() => {
    // 固定為 2024/10/12，使 10月12日 被判定為今日
    vi.setSystemTime(new Date(2024, 9, 12));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('應將日期與說明傳遞給 DateTag', async () => {
    const wrapper = await mountSuspended(DailyScheduleCard, {
      props: { schedule: scheduleMock },
      global: { stubs: globalStubs },
    });

    const dateTag = wrapper.get('[data-testid="date-tag"]');
    expect(dateTag.attributes('data-datetime')).toBe('10月12日');
    expect(dateTag.text()).toContain('特別營業');
  });

  it('應渲染早班與晚班兩列 ShiftRow 並傳入對應人數', async () => {
    const wrapper = await mountSuspended(DailyScheduleCard, {
      props: {
        schedule: { ...scheduleMock, date: { ...scheduleMock.date, datetime: '10月20日' } },
      },
      global: { stubs: globalStubs },
    });

    const rows = wrapper.findAll('[data-testid="shift-row"]');
    expect(rows).toHaveLength(2);
    expect(rows[0]?.attributes('data-type')).toBe('day');
    expect(rows[0]?.attributes('data-count')).toBe('2');
    expect(rows[1]?.attributes('data-type')).toBe('night');
    expect(rows[1]?.attributes('data-count')).toBe('1');
  });

  it('日期為今日時應標記 data-today 為 true', async () => {
    const wrapper = await mountSuspended(DailyScheduleCard, {
      props: { schedule: scheduleMock },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="daily-schedule-card"]').attributes('data-today')).toBe(
      'true'
    );
  });

  it('日期非今日時 data-today 應為 false', async () => {
    const wrapper = await mountSuspended(DailyScheduleCard, {
      props: {
        schedule: { ...scheduleMock, date: { ...scheduleMock.date, datetime: '10月25日' } },
      },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="daily-schedule-card"]').attributes('data-today')).toBe(
      'false'
    );
  });

  it('應將 highlightedAgents 傳遞給兩列 ShiftRow', async () => {
    const highlightedAgents = new Set(['泠泠', '米捲']);

    const wrapper = await mountSuspended(DailyScheduleCard, {
      props: { schedule: scheduleMock, highlightedAgents },
      global: { stubs: globalStubs },
    });

    const rows = wrapper.findAll('[data-testid="shift-row"]');
    expect(rows[0]?.attributes('data-highlighted')).toContain('泠泠');
    expect(rows[1]?.attributes('data-highlighted')).toContain('米捲');
  });

  it('店休日（灰底）應顯示「休」印章而非班別列', async () => {
    const wrapper = await mountSuspended(DailyScheduleCard, {
      props: {
        schedule: {
          date: { datetime: '10月13日', backgroundColor: '#999999', description: '' },
          day: [],
          night: [],
        },
      },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="daily-closed"]').text()).toContain('CLOSED');
    expect(wrapper.findAll('[data-testid="shift-row"]')).toHaveLength(0);
  });
});
