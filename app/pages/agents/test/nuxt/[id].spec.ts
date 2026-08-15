import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import AgentDetailPage from '~/pages/agents/[id].vue';
import { AGENTS } from '~~/shared/constant';
import type { ShiftSchedule } from '~~/shared/types';

/**
 * 這頁是 SSR，且「無排班」與「班表沒拿到」原本渲染成同一個空狀態 —— Sheets 掛掉時
 * 首屏 HTML 會直接宣告這位探員沒班並被爬蟲收走。三個狀態各釘一條。
 */
const { useRouteMock, useAgentMock, useStatisticsMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(),
  useAgentMock: vi.fn(),
  useStatisticsMock: vi.fn(),
}));
mockNuxtImport('useRoute', () => useRouteMock);
mockNuxtImport('useAgent', () => useAgentMock);
mockNuxtImport('useStatistics', () => useStatisticsMock);

const rin = AGENTS.get('泠泠');

const scheduleItem = () => ({
  date: { iso: '2024-10-30', datetime: '10月30日', backgroundColor: '', description: '' },
  dayShifts: [{ name: '泠泠', textColor: '' }],
  nightShifts: [] as ShiftSchedule['day'],
});

function stubPage({ schedules = [] as ReturnType<typeof scheduleItem>[], hasError = false } = {}) {
  useRouteMock.mockReturnValue({ params: { id: 'rin' }, query: {} });
  useAgentMock.mockResolvedValue({
    agentInfo: ref(rin),
    agentSchedules: ref(schedules),
    hasError: ref(hasError),
  });
  useStatisticsMock.mockResolvedValue({
    statistics: ref([]),
    dateRange: ref({ from: '', to: '' }),
    hasError: ref(false),
    isPending: ref(false),
  });
}

describe('/agents/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubPage();
  });

  it('有排班時顯示班次清單', async () => {
    stubPage({ schedules: [scheduleItem()] });

    const wrapper = await mountSuspended(AgentDetailPage);

    expect(wrapper.find('[data-testid="agent-schedule-list"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="agent-schedule-empty"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="agent-schedule-error"]').exists()).toBe(false);
  });

  it('真的沒排班時顯示「近期無排班」', async () => {
    stubPage({ schedules: [], hasError: false });

    const wrapper = await mountSuspended(AgentDetailPage);

    expect(wrapper.find('[data-testid="agent-schedule-empty"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('近期無排班');
    expect(wrapper.find('[data-testid="agent-schedule-error"]').exists()).toBe(false);
  });

  // 這條是重點：班表抓失敗時 agentSchedules 同樣是 []，不能因此宣告「無排班」
  it('班表載入失敗時顯示錯誤狀態，而非「近期無排班」', async () => {
    stubPage({ schedules: [], hasError: true });

    const wrapper = await mountSuspended(AgentDetailPage);

    expect(wrapper.find('[data-testid="agent-schedule-error"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('無法載入班表');
    expect(wrapper.find('[data-testid="agent-schedule-empty"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('近期無排班');
  });
});
