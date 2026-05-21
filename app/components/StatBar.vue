<script setup lang="ts">
// 出勤分佈用的 stacked bar：早班段走 --color-day、晚班段走 --color-night。
// 寬度以 maxTotal（排行中的最高總班次）為基準等比換算，讓各列 bar 可橫向比較。
const { dayCount, nightCount, maxTotal } = defineProps<{
  /** 早班次數 */
  dayCount: number;
  /** 晚班次數 */
  nightCount: number;
  /** 排行中的最高總班次，作為 bar 滿格基準 */
  maxTotal: number;
}>();

// maxTotal 為 0 時退回 1，避免除以零產生 NaN 寬度
const safeMax = computed(() => (maxTotal > 0 ? maxTotal : 1));
const dayWidth = computed(() => `${(dayCount / safeMax.value) * 100}%`);
const nightWidth = computed(() => `${(nightCount / safeMax.value) * 100}%`);
</script>

<template>
  <div
    class="flex h-[18px] w-full overflow-hidden rounded-sm bg-paper-2"
    role="img"
    :aria-label="`早班 ${dayCount} 班、晚班 ${nightCount} 班`"
    data-testid="stat-bar"
  >
    <span
      class="block h-full bg-day"
      :style="{ width: dayWidth }"
      data-testid="stat-bar-day"
    />
    <span
      class="block h-full bg-night"
      :style="{ width: nightWidth }"
      data-testid="stat-bar-night"
    />
  </div>
</template>
