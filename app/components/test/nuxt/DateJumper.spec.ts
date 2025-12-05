import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect } from 'vitest';
import DateJumper from '../../DateJumper.vue';

describe('DateJumper', () => {
  const mockDates = [
    { label: '12月5日', value: '12月5日' },
    { label: '12月6日', value: '12月6日' },
    { label: '12月7日', value: '12月7日' },
  ];

  it('renders when dates are provided', async () => {
    const wrapper = await mountSuspended(DateJumper, {
      props: {
        dates: mockDates,
      },
    });

    expect(wrapper.find('[data-testid="date-jumper"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('跳轉到：');
  });

  it('does not render when dates array is empty', async () => {
    const wrapper = await mountSuspended(DateJumper, {
      props: {
        dates: [],
      },
    });

    expect(wrapper.find('[data-testid="date-jumper"]').exists()).toBe(false);
  });

  it('emits jump event with correct value when date is selected', async () => {
    const wrapper = await mountSuspended(DateJumper, {
      props: {
        dates: mockDates,
      },
    });

    // 由於 USelectMenu 的互動較複雜，這裡測試元件的 emit
    const component = wrapper.vm;

    // 直接呼叫內部的 handleSelect 方法來測試 emit
    // @ts-expect-error - accessing internal method for testing
    component.handleSelect(mockDates[1]);

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('jump')).toBeTruthy();
    expect(wrapper.emitted('jump')![0]).toEqual(['12月6日']);
  });
});
