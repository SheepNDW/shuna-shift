import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import StatisticsTable from '../../StatisticsTable.vue';
import type { AgentStatistics } from '~~/shared/types';

// 依總班次降序排列（server 端 calculateAgentStatistics 的輸出順序）。
// luna 設為非正職，用於驗證 FULL 標記僅出現於正職探員。
const mockStatistics: AgentStatistics[] = [
  {
    agentId: 'rin',
    name: '泠泠',
    picture: 'https://example.com/rin.jpg',
    dayCount: 10,
    nightCount: 5,
    total: 15,
    isFullTime: true,
  },
  {
    agentId: 'juano',
    name: '米捲',
    picture: 'https://example.com/juano.jpg',
    dayCount: 8,
    nightCount: 7,
    total: 15,
    isFullTime: true,
  },
  {
    agentId: 'luna',
    name: 'Luna',
    picture: 'https://example.com/luna.jpg',
    dayCount: 5,
    nightCount: 8,
    total: 13,
    isFullTime: false,
  },
];

describe('StatisticsTable', () => {
  it('應渲染表頭欄位', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: { statistics: mockStatistics },
    });

    const headerText = wrapper.findAll('th').map((th) => th.text()).join(' ');
    expect(headerText).toContain('探員');
    expect(headerText).toContain('分佈');
    expect(headerText).toContain('日');
    expect(headerText).toContain('夜');
    expect(headerText).toContain('總');
  });

  it('應顯示所有探員', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: { statistics: mockStatistics },
    });

    const names = wrapper
      .findAll('[data-testid="statistics-table-name"]')
      .map((el) => el.text());
    expect(names).toEqual(['泠泠', '米捲', 'Luna']);
  });

  it('應以陣列順序顯示補零排名', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: { statistics: mockStatistics },
    });

    const rows = wrapper.findAll('[data-testid="statistics-table-row"]');
    expect(rows[0]?.text()).toContain('01');
    expect(rows[1]?.text()).toContain('02');
    expect(rows[2]?.text()).toContain('03');
  });

  it('應顯示補零後的班次數字', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: { statistics: mockStatistics },
    });

    // 泠泠：日 10 / 夜 05 / 總 15
    const firstRow = wrapper.findAll('[data-testid="statistics-table-row"]')[0];
    expect(firstRow?.text()).toContain('10');
    expect(firstRow?.text()).toContain('05');
    expect(firstRow?.text()).toContain('15');
  });

  it('探員名稱應連結至個人頁面', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: { statistics: mockStatistics },
    });

    const links = wrapper.findAll('[data-testid="statistics-table-link"]');
    expect(links[0]?.attributes('href')).toContain('/agents/rin');
  });

  it('每列應渲染一個出勤分佈 bar', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: { statistics: mockStatistics },
    });

    expect(wrapper.findAll('[data-testid="stat-bar"]')).toHaveLength(3);
  });

  it('FULL 標記應僅出現於正職探員', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: { statistics: mockStatistics },
    });

    // rin 與 juano 為正職，luna 非正職
    expect(wrapper.findAll('[data-testid="statistics-table-full"]')).toHaveLength(2);
  });

  it('沒有資料時應顯示空狀態', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: { statistics: [] },
    });

    expect(wrapper.find('[data-testid="statistics-table-empty"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('沒有統計資料');
    expect(wrapper.find('table').exists()).toBe(false);
  });
});
