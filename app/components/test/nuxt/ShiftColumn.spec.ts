import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ShiftColumn from '../../ShiftColumn.vue';

const AgentPortraitStub = defineComponent({
  props: {
    name: { type: String, required: true },
    textColor: { type: String, default: '' },
  },
  template: '<div data-testid="agent-portrait">{{ name }}</div>',
});

const ShiftGlyphStub = defineComponent({
  props: {
    type: { type: String, required: true },
  },
  template: '<i data-testid="shift-glyph" :data-type="type" />',
});

const globalStubs = {
  AgentPortrait: AgentPortraitStub,
  ShiftGlyph: ShiftGlyphStub,
} as const;

describe('ShiftColumn', () => {
  it('早班應顯示標題、人數與探員頭像', async () => {
    const wrapper = await mountSuspended(ShiftColumn, {
      props: {
        type: 'day',
        agents: [
          { name: '泠泠', textColor: '' },
          { name: '七尾', textColor: '#ff9900' },
        ],
      },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="shift-name"]').text()).toBe('早班');
    expect(wrapper.get('[data-testid="shift-count"]').text()).toBe('02');
    expect(wrapper.findAll('[data-testid="agent-portrait"]')).toHaveLength(2);
    expect(wrapper.get('[data-testid="shift-glyph"]').attributes('data-type')).toBe('day');
  });

  it('晚班應顯示晚班標題', async () => {
    const wrapper = await mountSuspended(ShiftColumn, {
      props: {
        type: 'night',
        agents: [{ name: '米捲', textColor: '#93c47d' }],
      },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="shift-name"]').text()).toBe('晚班');
    expect(wrapper.get('[data-testid="shift-count"]').text()).toBe('01');
  });

  it('無排班時應顯示空狀態而非探員頭像', async () => {
    const wrapper = await mountSuspended(ShiftColumn, {
      props: { type: 'day', agents: [] },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="shift-count"]').text()).toBe('00');
    expect(wrapper.findAll('[data-testid="agent-portrait"]')).toHaveLength(0);
    expect(wrapper.get('[data-testid="shift-empty"]').text()).toContain('無排班');
  });
});
