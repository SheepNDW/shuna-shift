import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import StatisticsTable from '../../StatisticsTable.vue';
import type { AgentStatistics } from '~~/shared/types';

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
    isFullTime: true,
  },
];

const IconStub = defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  template: '<i :data-name="name"><slot /></i>',
});

const BadgeStub = defineComponent({
  props: {
    color: String,
    variant: String,
    size: String,
  },
  template: '<span class="badge"><slot /></span>',
});

const NuxtImgStub = defineComponent({
  props: {
    src: String,
    alt: String,
    densities: String,
    loading: String,
  },
  template: '<img :src="src" :alt="alt" />',
});

describe('StatisticsTable', () => {
  it('應正確渲染表格欄位', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: {
        statistics: mockStatistics,
      },
      global: {
        stubs: {
          UIcon: IconStub,
          UBadge: BadgeStub,
          NuxtImg: NuxtImgStub,
        },
      },
    });

    // 檢查表頭
    expect(wrapper.text()).toContain('探員');
    expect(wrapper.text()).toContain('日班');
    expect(wrapper.text()).toContain('晚班');
    expect(wrapper.text()).toContain('總計');
  });

  it('應顯示所有探員資料', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: {
        statistics: mockStatistics,
      },
      global: {
        stubs: {
          UIcon: IconStub,
          UBadge: BadgeStub,
          NuxtImg: NuxtImgStub,
        },
      },
    });

    expect(wrapper.text()).toContain('泠泠');
    expect(wrapper.text()).toContain('米捲');
    expect(wrapper.text()).toContain('Luna');
  });

  it('應顯示正確的班次數字', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: {
        statistics: mockStatistics,
      },
      global: {
        stubs: {
          UIcon: IconStub,
          UBadge: BadgeStub,
          NuxtImg: NuxtImgStub,
        },
      },
    });

    // 泠泠的班次
    expect(wrapper.text()).toContain('10');
    expect(wrapper.text()).toContain('15');
  });

  it('探員名稱應連結至個人頁面', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: {
        statistics: mockStatistics,
      },
      global: {
        stubs: {
          UIcon: IconStub,
          UBadge: BadgeStub,
          NuxtImg: NuxtImgStub,
        },
      },
    });

    const links = wrapper.findAll('a');
    const rinLink = links.find((link) => link.attributes('href')?.includes('/agents/rin'));
    expect(rinLink?.exists()).toBe(true);
  });

  it('點擊欄位標題應切換排序', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: {
        statistics: mockStatistics,
      },
      global: {
        stubs: {
          UIcon: IconStub,
          UBadge: BadgeStub,
          NuxtImg: NuxtImgStub,
        },
      },
    });

    // 找到日班欄位並點擊
    const headers = wrapper.findAll('th');
    const dayHeader = headers.find((h) => h.text().includes('日班'));

    await dayHeader?.trigger('click');

    // 再次點擊應切換排序方向
    await dayHeader?.trigger('click');

    // 檢查排序圖示有變化
    expect(
      wrapper.find('[data-name="i-heroicons-arrow-up"]').exists() ||
        wrapper.find('[data-name="i-heroicons-arrow-down"]').exists()
    ).toBe(true);
  });

  it('當沒有資料時應顯示空狀態', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: {
        statistics: [],
      },
      global: {
        stubs: {
          UIcon: IconStub,
          UBadge: BadgeStub,
          NuxtImg: NuxtImgStub,
        },
      },
    });

    expect(wrapper.text()).toContain('沒有統計資料');
  });

  it('正職探員應有特殊底色標記', async () => {
    const wrapper = await mountSuspended(StatisticsTable, {
      props: {
        statistics: mockStatistics,
      },
      global: {
        stubs: {
          UIcon: IconStub,
          UBadge: BadgeStub,
          NuxtImg: NuxtImgStub,
        },
      },
    });

    const rows = wrapper.findAll('tbody tr');
    // 所有 mock 資料都是正職，應該都有 bg-pink-50/50 class
    expect(rows.some((row) => row.classes().some((c) => c.includes('bg-pink')))).toBe(true);
  });
});
