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

// 摘要四格數據（日總 / 夜總 / 總計 / MVP）；topAgent 另抽 computed 便於 template 收斂型別
const summary = computed(() => summarizeStatistics(statistics.value));
const topAgent = computed(() => summary.value.topAgent);

// 統計期間：以資料實際日期範圍呈現於 PageHeader meta
const dateRangeLabel = computed(() => formatDateRange(data.value?.metadata.dateRange));
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
    <LoadingState v-if="status === 'pending'" message="載入統計資料中…" />

    <!-- 內容 -->
    <template v-else-if="data">
      <!-- 摘要四格：日總 / 夜總 / 總計 / MVP -->
      <section
        v-if="hasStatistics && topAgent"
        class="mb-12 grid grid-cols-4 gap-4 max-[920px]:grid-cols-2 max-xs:grid-cols-1"
        data-testid="summary-tiles"
      >
        <SummaryTile
          kanji="日"
          label="DAY SHIFTS"
          desc="早班總次數"
          :value="summary.totalDay"
          accent="day"
        />
        <SummaryTile
          kanji="夜"
          label="NIGHT SHIFTS"
          desc="晚班總次數"
          :value="summary.totalNight"
          accent="night"
        />
        <SummaryTile
          kanji="總"
          label="TOTAL"
          desc="班次總合"
          :value="summary.totalShifts"
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
    <EmptyState
      v-else
      kanji="無"
      title="無法載入統計資料"
      subtitle="請稍後再重新整理頁面。"
      data-testid="statistics-error"
    />
  </UContainer>
</template>
