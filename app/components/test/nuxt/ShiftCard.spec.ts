import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { defineComponent } from 'vue';
import ShiftCard from '../../ShiftCard.vue';

const AgentCardStub = defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
    textColor: {
      type: String,
      default: '',
    },
  },
  template: '<div data-testid="agent-card">{{ name }}-{{ textColor }}</div>',
});

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
  template: '<span data-testid="badge"><slot /></span>',
});

const NuxtLinkStub = defineComponent({
  template: '<a data-testid="nuxt-link"><slot /></a>',
});

const NuxtImgStub = defineComponent({
  props: {
    src: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: '',
    },
  },
  template: '<img :src="src" :alt="alt" />',
});

describe('ShiftCard', () => {
  const globalStubs = {
    AgentCard: AgentCardStub,
    UIcon: IconStub,
    UBadge: BadgeStub,
    NuxtLink: NuxtLinkStub,
    NuxtImg: NuxtImgStub,
  } as const;

  describe('日班渲染', () => {
    it('當有探員資料時應顯示探員清單與人數', async () => {
      const wrapper = await mountSuspended(ShiftCard, {
        props: {
          shiftType: 'day',
          agents: [
            { name: '泠泠', textColor: '#000000' },
            { name: '七尾', textColor: '#ff9900' },
          ],
        },
        global: {
          stubs: globalStubs,
        },
      });

      expect(wrapper.find('[data-name="i-heroicons-sun"]').exists()).toBe(true);
      expect(wrapper.find('h4').text()).toBe('早班');
      expect(wrapper.find('[data-testid="badge"]').text()).toBe('2');
      expect(wrapper.findAll('[data-testid="agent-card"]').length).toBe(2);
    });

    it('當標記為空值時應顯示空狀態訊息', async () => {
      const wrapper = await mountSuspended(ShiftCard, {
        props: {
          shiftType: 'day',
          agents: [],
          isEmpty: true,
        },
        global: {
          stubs: globalStubs,
        },
      });

      expect(wrapper.findAll('[data-testid="agent-card"]').length).toBe(0);
      expect(wrapper.text()).toContain('早班無排班');
    });
  });

  describe('晚班渲染', () => {
    it('應顯示晚班標題與對應圖示', async () => {
      const wrapper = await mountSuspended(ShiftCard, {
        props: {
          shiftType: 'night',
          agents: [{ name: '米捲', textColor: '#93c47d' }],
        },
        global: {
          stubs: globalStubs,
        },
      });

      expect(wrapper.find('[data-name="i-heroicons-moon"]').exists()).toBe(true);
      expect(wrapper.find('h4').text()).toBe('晚班');
      expect(wrapper.find('[data-testid="badge"]').text()).toBe('1');
      expect(wrapper.text()).toContain('米捲-#93c47d');
    });
  });

  describe('高亮探員功能', () => {
    it('當有 highlightedAgents 時，高亮探員應排在前面', async () => {
      const agents = [
        { name: '泠泠', textColor: '#000000' },
        { name: '七尾', textColor: '#ff9900' },
        { name: '米捲', textColor: '#93c47d' },
      ];
      const highlightedAgents = new Set(['米捲']);

      const wrapper = await mountSuspended(ShiftCard, {
        props: {
          shiftType: 'day',
          agents,
          highlightedAgents,
        },
        global: {
          stubs: globalStubs,
        },
      });

      const agentCards = wrapper.findAll('[data-testid="agent-card"]');
      expect(agentCards).toHaveLength(3);
      // 高亮的 米捲 應該排在第一個
      expect(agentCards[0]?.text()).toContain('米捲');
    });

    it('當沒有 highlightedAgents 時，維持原本順序', async () => {
      const agents = [
        { name: '泠泠', textColor: '#000000' },
        { name: '七尾', textColor: '#ff9900' },
      ];

      const wrapper = await mountSuspended(ShiftCard, {
        props: {
          shiftType: 'day',
          agents,
        },
        global: {
          stubs: globalStubs,
        },
      });

      const agentCards = wrapper.findAll('[data-testid="agent-card"]');
      expect(agentCards[0]?.text()).toContain('泠泠');
      expect(agentCards[1]?.text()).toContain('七尾');
    });

    it('多個高亮探員時，高亮探員皆應排在前面', async () => {
      const agents = [
        { name: '泠泠', textColor: '#000000' },
        { name: '七尾', textColor: '#ff9900' },
        { name: '米捲', textColor: '#93c47d' },
        { name: '小花', textColor: '#ff0000' },
      ];
      const highlightedAgents = new Set(['米捲', '小花']);

      const wrapper = await mountSuspended(ShiftCard, {
        props: {
          shiftType: 'day',
          agents,
          highlightedAgents,
        },
        global: {
          stubs: globalStubs,
        },
      });

      const agentCards = wrapper.findAll('[data-testid="agent-card"]');
      // 高亮的探員應排在前兩個（維持原本相對順序）
      expect(agentCards[0]?.text()).toContain('米捲');
      expect(agentCards[1]?.text()).toContain('小花');
      expect(agentCards[2]?.text()).toContain('泠泠');
      expect(agentCards[3]?.text()).toContain('七尾');
    });
  });
});
