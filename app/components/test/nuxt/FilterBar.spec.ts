import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, ref } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import type { JumpDate } from '~~/shared/types';
import FilterBar from '../../FilterBar.vue';

const mountFilterBar = async (initialSelected: string[] = [], dates: JumpDate[] = []) => {
  const model = ref<string[]>([...initialSelected]);
  const jumped = ref<string[]>([]);
  const WrapperComponent = defineComponent({
    components: { FilterBar },
    setup() {
      return { model, dates, onJump: (d: string) => jumped.value.push(d) };
    },
    template: '<FilterBar v-model="model" :dates="dates" @jump="onJump" />',
  });

  const wrapper = await mountSuspended(WrapperComponent);
  return { wrapper, model, jumped };
};

describe('FilterBar', () => {
  beforeEach(() => {
    // 絕對時刻（台北正午）；本地建構式會跟著 runner 時區漂移，見 app/utils/date.ts
    vi.setSystemTime(new Date('2024-10-12T12:00:00+08:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('應為每位探員渲染一個篩選 chip', async () => {
    const { wrapper } = await mountFilterBar();

    expect(wrapper.findAll('[data-testid="filter-chip"]').length).toBeGreaterThan(0);
  });

  it('點擊 chip 應切換探員選取狀態', async () => {
    const { wrapper, model } = await mountFilterBar();

    const firstChip = wrapper.findAll('[data-testid="filter-chip"]')[0]!;
    await firstChip.trigger('click');
    expect(model.value.length).toBe(1);

    await firstChip.trigger('click');
    expect(model.value.length).toBe(0);
  });

  it('已選取的 chip 應標記 aria-pressed 為 true', async () => {
    const { wrapper } = await mountFilterBar();

    const firstChip = wrapper.findAll('[data-testid="filter-chip"]')[0]!;
    expect(firstChip.attributes('aria-pressed')).toBe('false');

    await firstChip.trigger('click');
    expect(firstChip.attributes('aria-pressed')).toBe('true');
  });

  it('點擊清除按鈕應清空所有選取', async () => {
    const { wrapper, model } = await mountFilterBar();

    await wrapper.findAll('[data-testid="filter-chip"]')[0]!.trigger('click');
    expect(wrapper.find('[data-testid="filter-clear"]').exists()).toBe(true);

    await wrapper.get('[data-testid="filter-clear"]').trigger('click');
    expect(model.value).toEqual([]);
  });

  it('無選取時不顯示清除按鈕', async () => {
    const { wrapper } = await mountFilterBar();

    expect(wrapper.find('[data-testid="filter-clear"]').exists()).toBe(false);
  });

  // pill 顯示標籤、但 emit 出去的是 ISO —— /shifts 用它定位卡片的 DOM id，
  // 標籤不帶年份、跨年會撞 id。
  it('提供 dates 時應渲染 jump pill 並於點擊時 emit ISO 日期', async () => {
    const { wrapper, jumped } = await mountFilterBar([], [
      { iso: '2024-10-12', label: '10月12日' },
      { iso: '2024-10-13', label: '10月13日' },
    ]);

    const pills = wrapper.findAll('[data-testid="jump-pill"]');
    expect(pills).toHaveLength(2);
    expect(pills[0]?.text()).toContain('10月12日');

    await pills[1]!.trigger('click');
    expect(jumped.value).toEqual(['2024-10-13']);
  });

  it('今日的 pill 應以 ISO 比對後標記為當日樣式', async () => {
    // 系統時間釘在台北 2024/10/12
    const { wrapper } = await mountFilterBar([], [
      { iso: '2024-10-12', label: '10月12日' },
      { iso: '2023-10-12', label: '10月12日' }, // 去年同一天，標籤完全相同
    ]);

    const pills = wrapper.findAll('[data-testid="jump-pill"]');
    expect(pills[0]?.classes()).toContain('bg-ink');
    expect(pills[1]?.classes()).not.toContain('bg-ink');
  });

  it('未提供 dates 時不顯示跳轉區塊', async () => {
    const { wrapper } = await mountFilterBar();

    expect(wrapper.find('[data-testid="filter-jump"]').exists()).toBe(false);
  });

  // 卒業探員若仍出現在篩選 chip,點選後近期班表查無資料 → 使用者體感 filter 壞掉
  it('卒業探員不應出現在篩選 chip 列表中', async () => {
    const { wrapper } = await mountFilterBar();

    const chipNames = wrapper.findAll('[data-testid="filter-chip"]').map((c) => c.text());
    expect(chipNames).not.toContain('明里');
    expect(chipNames).not.toContain('棠棠');
    expect(chipNames).not.toContain('花緒');
  });
});
