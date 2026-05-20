<script setup lang="ts">
// 探員詳情頁的單列排班:三欄式 schedule-row(日期 / 早晚 badge / 當日全體連結)。
// 取代舊版 UCard + ShiftItem 嵌套,以表格化呈現探員的近期排班。
//
// 樣式策略:layout / 間距 / 字級走 Tailwind utility;早 / 晚 badge 沿用
// components.css 的 .shift-icon-day / .shift-icon-night class(currentColor)。
import type { AgentScheduleItem } from '~~/app/composables/useAgent';

const { schedule } = defineProps<{
  schedule: AgentScheduleItem;
}>();

const today = computed(() => isToday(schedule.date.datetime));
const parsed = computed(() => parseDateLabel(schedule.date.datetime));
const weekday = computed(() => getWeekdayLabel(schedule.date.datetime));

const hasDayShift = computed(() => schedule.dayShifts.length > 0);
const hasNightShift = computed(() => schedule.nightShifts.length > 0);
</script>

<template>
  <li
    class="grid items-center gap-4 border-b border-rule-2 px-5 py-4 last:border-b-0 max-[920px]:grid-cols-1 max-[920px]:gap-2 sm:grid-cols-[220px_1fr_auto] sm:gap-5"
    :class="{ 'bg-shu-soft': today }"
    data-testid="agent-schedule-row"
    :data-today="today"
  >
    <div class="flex items-center gap-2.5">
      <span
        class="mono tnum text-fs-18 text-ink"
        data-testid="agent-schedule-date"
      >{{ schedule.date.datetime }}</span>
      <span
        v-if="parsed"
        class="serif text-fs-15 text-ink-soft"
        data-testid="agent-schedule-weekday"
      >星期{{ weekday }}</span>
      <span
        v-if="today"
        class="stamp-label text-shu"
        data-testid="agent-schedule-today"
      >TODAY</span>
    </div>

    <div class="flex flex-wrap gap-2" data-testid="agent-schedule-badges">
      <span
        v-if="hasDayShift"
        class="shift-icon-day inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-fs-13"
        data-testid="agent-schedule-badge-day"
      >
        <span class="block h-3.5 w-3.5">
          <ShiftGlyph type="day" />
        </span>
        早班
      </span>
      <span
        v-if="hasNightShift"
        class="shift-icon-night inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-fs-13"
        data-testid="agent-schedule-badge-night"
      >
        <span class="block h-3.5 w-3.5">
          <ShiftGlyph type="night" />
        </span>
        晚班
      </span>
    </div>

    <NuxtLink
      :to="`/shifts?date=${schedule.date.datetime}`"
      class="text-fs-13 text-ink-soft transition-colors hover:text-shu"
      data-testid="agent-schedule-link"
    >當日全體 →</NuxtLink>
  </li>
</template>
