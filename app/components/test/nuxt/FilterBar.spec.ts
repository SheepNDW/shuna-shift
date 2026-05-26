import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, ref } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import FilterBar from '../../FilterBar.vue';

const mountFilterBar = async (initialSelected: string[] = [], dates: string[] = []) => {
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
    vi.setSystemTime(new Date(2024, 9, 12));
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

  it('提供 dates 時應渲染 jump pill 並於點擊時 emit jump', async () => {
    const { wrapper, jumped } = await mountFilterBar([], ['10月12日', '10月13日']);

    const pills = wrapper.findAll('[data-testid="jump-pill"]');
    expect(pills).toHaveLength(2);

    await pills[1]!.trigger('click');
    expect(jumped.value).toEqual(['10月13日']);
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
