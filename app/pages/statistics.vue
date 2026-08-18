<script setup lang="ts">
const { statistics, dateRange, hasError, isPending } = await useStatistics();

useSeo({
  title: '值班統計',
  description: '查看喫茶 朱雫 Maid Café 探員近期的值班統計資料。',
});

const hasStatistics = computed(() => statistics.value.length > 0);

// 摘要四格數據（日總 / 夜總 / 總計 / MVP）；topAgent 另抽 computed 便於 template 收斂型別
const summary = computed(() => summarizeStatistics(statistics.value));
const topAgent = computed(() => summary.value.topAgent);

// 統計期間：以資料實際日期範圍呈現於 PageHeader meta
const dateRangeLabel = computed(() => formatDateRange(dateRange.value));
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
    <LoadingState v-if="isPending" message="載入統計資料中…" />

    <!-- 錯誤狀態：改判 hasError 而非 data 是否存在 —— 現在 useStatistics 一律給空殼
         default，data 永遠不為 null，拿它當分支條件會讓錯誤狀態永遠不顯示。 -->
    <EmptyState
      v-else-if="hasError"
      kanji="無"
      title="無法載入統計資料"
      subtitle="請稍後再重新整理頁面。"
      data-testid="statistics-error"
    />

    <!-- 內容 -->
    <template v-else>
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
  </UContainer>
</template>
