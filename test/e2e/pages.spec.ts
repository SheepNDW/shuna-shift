import { expect, test } from '@nuxt/test-utils/playwright';
import {
  FILTER_AGENT,
  FUTURE_OFFSETS,
  SCROLL_TARGET_OFFSET,
  TODAY_AGENTS,
  addDays,
  hasFilterAgent,
  taipeiTodayIso,
} from './fake-sheets/data';

/**
 * 頁面的 smoke test：對 build 出來的 server 走一遍主要頁面，資料來自假 Sheets。
 *
 * 已知風險：假 Sheets、頁面、這支測試各自算一次「台北的今天」。測試剛好跨過台北午夜時，
 * 三邊拿到的可能不是同一天，這裡的斷言會失敗。機率很低，重跑即可，不為此固定時鐘
 * （build 出來的 server 那一側很難固定）。
 */
const today = taipeiTodayIso();
const futureIsos = FUTURE_OFFSETS.map((offset) => addDays(today, offset));

const cardId = (iso: string): string => `schedule-${iso}`;

test('首頁顯示今天當班的探員', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' });

  const todaySection = page.getByRole('region', { name: /TODAY/ });

  await expect(todaySection.getByTestId('agent-name')).toHaveText([
    ...TODAY_AGENTS.day,
    ...TODAY_AGENTS.night,
  ]);
});

test('/shifts 選了探員之後，列表只剩那位探員有班的日子', async ({ page, goto }) => {
  await goto('/shifts', { waitUntil: 'hydration' });
  const cards = page.getByTestId('daily-schedule-card');
  const cardIds = (): Promise<string[]> =>
    cards.evaluateAll((elements) => elements.map((element) => element.id));

  // 先確認篩選前是全部的日子，後面「變少了」才有意義
  await expect.poll(cardIds).toEqual(futureIsos.map(cardId));

  await page
    .getByTestId('filter-bar')
    .getByRole('button', { name: FILTER_AGENT, exact: true })
    .click();

  const expectedIsos = FUTURE_OFFSETS.filter(hasFilterAgent).map((offset) =>
    addDays(today, offset),
  );
  await expect.poll(cardIds).toEqual(expectedIsos.map(cardId));
});

test('/shifts?date= 會捲到那一天，停在畫面上方附近', async ({ page, goto }) => {
  /** 卡片上緣離視窗頂端多近才算「在上方附近」。卡片自己的 scroll-margin 最多 96px */
  const NEAR_TOP_PX = 150;
  const targetIso = addDays(today, SCROLL_TARGET_OFFSET);

  await goto(`/shifts?date=${targetIso}`, { waitUntil: 'hydration' });

  // 頁面用 rAF 持續校正（最多 3 秒），所以用輪詢等它停下來，不用固定的 sleep
  await expect(async () => {
    // 量兩次、中間隔幾個 frame：只量一次的話，「捲到了又被拉走」也會過
    const { top, topAfterFrames, scrollY } = await page
      .locator(`#${cardId(targetIso)}`)
      .evaluate(async (element) => {
        const FRAMES_TO_WAIT = 5;
        const top = element.getBoundingClientRect().top;
        for (let frame = 0; frame < FRAMES_TO_WAIT; frame++) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }

        return {
          top,
          topAfterFrames: element.getBoundingClientRect().top,
          scrollY: window.scrollY,
        };
      });

    // 沒捲動的話這張卡片在第一屏以下；scrollY > 0 排除「視窗剛好夠高」的假陽性
    expect(scrollY).toBeGreaterThan(0);
    expect(top).toBeGreaterThanOrEqual(0);
    expect(top).toBeLessThanOrEqual(NEAR_TOP_PX);
    expect(topAfterFrames).toBe(top);
  }).toPass({ timeout: 5_000 });
});

// 與下面的 404 成對：/agents/[id] 整頁壞掉或被刪掉時，沒對到的路由一樣回 404，
// 只測反面的話那種情況照樣是綠的
test('存在的探員頁回 200，而且顯示那位探員的名字', async ({ page }) => {
  const response = await page.goto('/agents/keiko');

  expect(response?.status()).toBe(200);
  await expect(page.getByTestId('agent-profile-name')).toContainText('景子');
});

test('不存在的探員頁回 404', async ({ page }) => {
  const response = await page.goto('/agents/no-such-agent');

  expect(response?.status()).toBe(404);
});

test('/statistics 的統計表至少有一列', async ({ page, goto }) => {
  await goto('/statistics', { waitUntil: 'hydration' });

  await expect(page.getByTestId('statistics-table-row').first()).toBeVisible();
});
