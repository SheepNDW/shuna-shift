<script setup lang="ts">
// 首頁底部「近日のシフト」預覽卡：日期 + 早 / 晚班人數與前兩位探員。
// 店休日改顯示「休」取代早晚班人數列。
import { getSpecialDateKind } from '~~/shared/date-meta';

const { schedule } = defineProps<{
  schedule: ShiftSchedule;
}>();

const parsedDate = computed(() => parseDateLabel(schedule.date.datetime));
const weekday = computed(() => getWeekdayLabel(schedule.date.iso));
const isClosed = computed(
  () => getSpecialDateKind(schedule.date.backgroundColor) === 'closed'
);

/** 取班別前兩位探員名稱，超過則加省略號；無人時回傳「—」 */
function previewNames(list: { name: string }[]): string {
  if (list.length === 0) return '—';
  const head = list
    .slice(0, 2)
    .map((agent) => agent.name)
    .join('、');
  return list.length > 2 ? `${head}…` : head;
}

const dayCount = computed(() => padZero(schedule.day.length));
const nightCount = computed(() => padZero(schedule.night.length));
const dayNames = computed(() => previewNames(schedule.day));
const nightNames = computed(() => previewNames(schedule.night));
</script>

<template>
  <NuxtLink
    class="flex flex-col gap-3 rounded-lg border border-rule bg-surface p-5 transition duration-150 hover:border-ink-soft motion-safe:hover:-translate-y-px"
    to="/shifts"
  >
    <div class="flex items-baseline gap-2.5 border-b border-rule-2 pb-2.5">
      <span
        v-if="parsedDate"
        class="mono tnum text-fs-22 font-medium text-ink"
        data-testid="upcoming-md"
      >
        {{ parsedDate.month }}/{{ parsedDate.day }}
      </span>
      <span class="serif text-fs-14 text-ink-soft" data-testid="upcoming-dow">
        星期{{ weekday }}
      </span>
    </div>

    <div
      v-if="isClosed"
      class="flex items-center gap-2 py-2"
      data-testid="upcoming-closed"
    >
      <span class="serif text-fs-28 text-shu" aria-hidden="true">休</span>
      <span class="stamp-label">店休日</span>
    </div>
    <div v-else class="flex flex-col gap-2">
      <div class="flex items-center gap-2.5 text-fs-13">
        <span
          class="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-day bg-day-soft p-1.5 text-day-deep"
        >
          <ShiftGlyph type="day" />
        </span>
        <span class="mono tnum w-5 text-ink-soft" data-testid="upcoming-num">{{ dayCount }}</span>
        <span class="truncate text-ink" data-testid="upcoming-names">{{ dayNames }}</span>
      </div>
      <div class="flex items-center gap-2.5 text-fs-13">
        <span
          class="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-night bg-night-soft p-1.5 text-night-deep"
        >
          <ShiftGlyph type="night" />
        </span>
        <span class="mono tnum w-5 text-ink-soft" data-testid="upcoming-num">{{ nightCount }}</span>
        <span class="truncate text-ink" data-testid="upcoming-names">{{ nightNames }}</span>
      </div>
    </div>

    <span
      v-if="schedule.date.description"
      class="stamp-label text-shu"
      data-testid="upcoming-note"
    >
      ※ {{ schedule.date.description }}
    </span>
  </NuxtLink>
</template>
