<script setup lang="ts">
import type { StatisticsResponse } from '~~/shared/types';

const TWO_HOURS = 2 * 60 * 60 * 1000;

const { data, status } = await useFetch<StatisticsResponse>('/api/statistics', {
  getCachedData(key, nuxtApp) {
    const cached = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    if (!cached) return undefined;

    const fetchedAt = new Date(cached.metadata?.lastUpdated).getTime();
    if (Number.isNaN(fetchedAt) || Date.now() - fetchedAt > TWO_HOURS) {
      return undefined;
    }

    return cached;
  },
});

const appConfig = useAppConfig();
useHead({
  title: `${appConfig.title} - 值班統計`,
  meta: [
    {
      name: 'description',
      content: '查看喫茶 朱雫 Maid Café 探員近期的值班統計資料',
    },
  ],
});

const statistics = computed(() => data.value?.statistics ?? []);
const hasStatistics = computed(() => statistics.value.length > 0);

// 早 / 晚 / 總班次摘要
const totalDay = computed(() =>
  statistics.value.reduce((sum, stat) => sum + stat.dayCount, 0),
);
const totalNight = computed(() =>
  statistics.value.reduce((sum, stat) => sum + stat.nightCount, 0),
);
const totalShifts = computed(() => totalDay.value + totalNight.value);

// MVP：榜首探員（statistics 已由 server 端依總班次降序排列）
const topAgent = computed(() => statistics.value[0] ?? null);

// 統計期間：以資料實際日期範圍呈現於 PageHeader meta
const dateRangeLabel = computed(() => {
  const range = data.value?.metadata.dateRange;
  if (!range?.from || !range?.to) return undefined;
  return `${range.from} – ${range.to}`;
});
</script>

<template>
  <UContainer class="py-8 md:py-12">
    <PageHeader
      kanji="計"
      label="STATISTICS · 出勤統計"
      title="出勤統計"
      subtitle="近三個月每位探員的日 / 夜班次數。"
      :meta="dateRangeLabel"
    />

    <!-- 載入中 -->
    <LoadingState v-if="status === 'pending'" message="載入統計資料中..." />

    <!-- 內容 -->
    <template v-else-if="data">
      <!-- 摘要四格：日總 / 夜總 / 總計 / MVP -->
      <section
        v-if="hasStatistics && topAgent"
        class="mb-12 grid grid-cols-4 gap-4 max-[920px]:grid-cols-2 max-[520px]:grid-cols-1"
        data-testid="summary-tiles"
      >
        <SummaryTile
          kanji="日"
          label="DAY SHIFTS"
          desc="早班總次數"
          :value="totalDay"
          accent="day"
        />
        <SummaryTile
          kanji="夜"
          label="NIGHT SHIFTS"
          desc="晚班總次數"
          :value="totalNight"
          accent="night"
        />
        <SummaryTile
          kanji="總"
          label="TOTAL"
          desc="班次總合"
          :value="totalShifts"
          accent="shu"
        />
        <SummaryTile
          kanji="冠"
          label="MOST · MVP"
          :desc="topAgent.name"
          :value="topAgent.total"
          accent="ink"
          :sub-value="`${topAgent.dayCount} 日 / ${topAgent.nightCount} 夜`"
        />
      </section>

      <!-- 出勤排行表 -->
      <StatisticsTable :statistics="statistics" />
    </template>

    <!-- 錯誤狀態 -->
    <div
      v-else
      class="flex flex-col items-center gap-3 py-20 text-center"
      data-testid="statistics-error"
    >
      <span class="empty-kanji serif" aria-hidden="true">無</span>
      <p class="serif text-fs-22 text-ink">無法載入統計資料</p>
      <p class="text-fs-14 text-ink-soft">請稍後再重新整理頁面</p>
    </div>
  </UContainer>
</template>
