<script setup lang="ts">
// 班表單日的日期標記：mono 月／日 + serif 星期 + TODAY 徽章 + 特殊日說明。
const {
  iso,
  datetime,
  isToday = false,
  description = '',
} = defineProps<{
  /** ISO 日期（格式：2026-08-31），用於推算星期 */
  iso: string;
  /** 顯示用日期標籤（格式：10月12日） */
  datetime: string;
  /** 是否為今日 */
  isToday?: boolean;
  /** 特殊日說明（如生誕祭）；無則留空 */
  description?: string;
}>();

const parsed = computed(() => parseDateLabel(datetime));
const weekday = computed(() => getWeekdayLabel(iso));
</script>

<template>
  <div class="flex flex-col items-start gap-1" data-testid="date-tag">
    <div v-if="parsed" class="flex items-baseline">
      <span
        class="mono tnum text-fs-36 font-medium leading-none text-ink"
        data-testid="date-tag-month"
      >{{ parsed.month }}</span>
      <span class="mx-0.5 text-fs-28 text-ink-mute">／</span>
      <span
        class="mono tnum text-fs-36 font-medium leading-none text-ink"
        data-testid="date-tag-day"
      >{{ parsed.day }}</span>
    </div>
    <span v-else class="mono tnum text-fs-22 text-ink" data-testid="date-tag-raw">
      {{ datetime }}
    </span>

    <span class="serif text-fs-16 text-ink-soft" data-testid="date-tag-dow">
      星期{{ weekday }}
    </span>

    <span
      v-if="isToday"
      class="mt-2 rounded-sm bg-shu px-2.5 py-[3px] font-mono text-fs-12 uppercase tracking-stamp text-paper"
      data-testid="date-tag-today"
    >今日 · TODAY</span>

    <span
      v-if="description"
      class="mt-1.5 text-fs-13 text-shu"
      data-testid="date-tag-desc"
    >{{ description }}</span>
  </div>
</template>
