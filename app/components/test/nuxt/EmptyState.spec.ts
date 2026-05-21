import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import EmptyState from '../../EmptyState.vue';

describe('EmptyState', () => {
  it('預設漢字為「空」並渲染標題', async () => {
    const wrapper = await mountSuspended(EmptyState, {
      props: { title: '沒有資料' },
    });

    expect(wrapper.get('.empty-kanji').text()).toBe('空');
    expect(wrapper.get('[data-testid="empty-state-title"]').text()).toBe('沒有資料');
  });

  it('渲染指定的漢字與副標', async () => {
    const wrapper = await mountSuspended(EmptyState, {
      props: { kanji: '休', title: '今日無排班', subtitle: '好好休息吧。' },
    });

    expect(wrapper.get('.empty-kanji').text()).toBe('休');
    expect(wrapper.get('[data-testid="empty-state-subtitle"]').text()).toBe('好好休息吧。');
  });

  it('未提供副標時不渲染副標節點', async () => {
    const wrapper = await mountSuspended(EmptyState, {
      props: { title: '沒有資料' },
    });

    expect(wrapper.find('[data-testid="empty-state-subtitle"]').exists()).toBe(false);
  });

  it('漢字圖章標記為裝飾性(aria-hidden)', async () => {
    const wrapper = await mountSuspended(EmptyState, {
      props: { title: '沒有資料' },
    });

    expect(wrapper.get('.empty-kanji').attributes('aria-hidden')).toBe('true');
  });

  it('提供 action slot 時渲染,未提供時不渲染', async () => {
    const without = await mountSuspended(EmptyState, {
      props: { title: '沒有資料' },
    });
    expect(without.find('[data-testid="empty-state-action"]').exists()).toBe(false);

    const withAction = await mountSuspended(EmptyState, {
      props: { title: '沒有資料' },
      slots: { action: '<button type="button">重試</button>' },
    });
    expect(withAction.find('[data-testid="empty-state-action"]').exists()).toBe(true);
    expect(withAction.get('[data-testid="empty-state-action"]').text()).toBe('重試');
  });
});
