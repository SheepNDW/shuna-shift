import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ShiftRow from '../../ShiftRow.vue';

const ShiftGlyphStub = defineComponent({
  props: { type: { type: String, required: true } },
  template: '<i data-testid="shift-glyph" :data-type="type" />',
});

const AgentChipStub = defineComponent({
  props: {
    name: { type: String, required: true },
    textColor: { type: String, default: '' },
    highlighted: { type: Boolean, default: false },
  },
  template:
    '<span data-testid="agent-chip" :data-highlighted="highlighted">{{ name }}</span>',
});

const globalStubs = {
  ShiftGlyph: ShiftGlyphStub,
  AgentChip: AgentChipStub,
} as const;

describe('ShiftRow', () => {
  it('早班應顯示「早班」名稱、人數與 day 圖示', async () => {
    const wrapper = await mountSuspended(ShiftRow, {
      props: {
        type: 'day',
        agents: [
          { name: '泠泠', textColor: '' },
          { name: '七尾', textColor: '#ff9900' },
        ],
      },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="shift-row-name"]').text()).toBe('早班');
    expect(wrapper.get('[data-testid="shift-row-count"]').text()).toBe('02');
    expect(wrapper.get('[data-testid="shift-glyph"]').attributes('data-type')).toBe('day');
    expect(wrapper.findAll('[data-testid="agent-chip"]')).toHaveLength(2);
  });

  it('晚班應顯示「晚班」名稱', async () => {
    const wrapper = await mountSuspended(ShiftRow, {
      props: { type: 'night', agents: [{ name: '米捲', textColor: '#93c47d' }] },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="shift-row-name"]').text()).toBe('晚班');
    expect(wrapper.get('[data-testid="shift-row-count"]').text()).toBe('01');
  });

  it('無排班時應顯示空狀態而非探員 chip', async () => {
    const wrapper = await mountSuspended(ShiftRow, {
      props: { type: 'day', agents: [] },
      global: { stubs: globalStubs },
    });

    expect(wrapper.get('[data-testid="shift-row-count"]').text()).toBe('00');
    expect(wrapper.findAll('[data-testid="agent-chip"]')).toHaveLength(0);
    expect(wrapper.get('[data-testid="shift-row-empty"]').text()).toBe('無排班');
  });

  it('高亮探員應排序提前並標記 highlighted', async () => {
    const wrapper = await mountSuspended(ShiftRow, {
      props: {
        type: 'day',
        agents: [
          { name: '泠泠', textColor: '' },
          { name: '七尾', textColor: '' },
        ],
        highlightedAgents: new Set(['七尾']),
      },
      global: { stubs: globalStubs },
    });

    const chips = wrapper.findAll('[data-testid="agent-chip"]');
    expect(chips[0]?.text()).toBe('七尾');
    expect(chips[0]?.attributes('data-highlighted')).toBe('true');
    expect(chips[1]?.attributes('data-highlighted')).toBe('false');
  });

  // 高亮比對走剝括號後的名稱。代班 / 時段註記在歷史班表約每週出現一次，
  // 比對原字串時這些班次會整批漏掉，症狀是「篩選看起來壞了」。
  // fixture 取歷史班表的真實樣本字串。
  describe('帶括號的儲存格', () => {
    it('選中的探員能命中其時段註記的班次', async () => {
      const wrapper = await mountSuspended(ShiftRow, {
        props: {
          type: 'day',
          agents: [
            { name: '泠泠', textColor: '' },
            { name: '亞米(~18:00)', textColor: '' },
          ],
          highlightedAgents: new Set(['亞米']),
        },
        global: { stubs: globalStubs },
      });

      const chips = wrapper.findAll('[data-testid="agent-chip"]');
      expect(chips[0]?.text()).toBe('亞米(~18:00)');
      expect(chips[0]?.attributes('data-highlighted')).toBe('true');
      expect(chips[1]?.attributes('data-highlighted')).toBe('false');
    });

    it('括號內被代班的探員不算當班，不應高亮', async () => {
      const wrapper = await mountSuspended(ShiftRow, {
        props: {
          type: 'day',
          agents: [{ name: '和実(亞米)', textColor: '' }],
          highlightedAgents: new Set(['亞米']),
        },
        global: { stubs: globalStubs },
      });

      expect(wrapper.get('[data-testid="agent-chip"]').attributes('data-highlighted')).toBe(
        'false'
      );
    });

    it('代班者本人被選中時應高亮', async () => {
      const wrapper = await mountSuspended(ShiftRow, {
        props: {
          type: 'day',
          agents: [{ name: '和実(亞米)', textColor: '' }],
          highlightedAgents: new Set(['和実']),
        },
        global: { stubs: globalStubs },
      });

      expect(wrapper.get('[data-testid="agent-chip"]').attributes('data-highlighted')).toBe(
        'true'
      );
    });
  });
});
