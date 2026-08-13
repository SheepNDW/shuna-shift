<script setup lang="ts">
// 班表單日卡：左側 DateTag、右側早 / 晚班 ShiftRow。
// 今日卡套用 .daily-card-today（朱紅邊框 + 左側朱紅實線，見 components.css）。
// 店休日（灰底 #999999）改於右側顯示「休」印章，不渲染班別列。
import { getSpecialDateKind } from '~~/shared/date-meta';

const {
  schedule,
  highlightedAgents = undefined,
} = defineProps<{
  schedule: ShiftSchedule;
  /** 篩選高亮的探員名稱集合；傳遞給 ShiftRow */
  highlightedAgents?: Set<string>;
}>();

const today = computed(() => isToday(schedule.date.iso));
const isClosed = computed(
  () => getSpecialDateKind(schedule.date.backgroundColor) === 'closed'
);
</script>

<template>
  <article
    class="grid grid-cols-[200px_1fr] gap-8 rounded-lg border border-rule bg-surface p-6 scroll-mt-24 max-[920px]:grid-cols-1 max-[920px]:gap-4 max-[920px]:scroll-mt-20"
    :class="{ 'daily-card-today': today }"
    data-testid="daily-schedule-card"
    :data-today="today"
  >
    <div
      class="border-r border-rule-2 pr-6 max-[920px]:border-r-0 max-[920px]:border-b max-[920px]:pr-0 max-[920px]:pb-4"
    >
      <DateTag
        :iso="schedule.date.iso"
        :datetime="schedule.date.datetime"
        :is-today="today"
        :description="schedule.date.description"
      />
    </div>

    <div
      v-if="isClosed"
      class="flex items-center gap-4 max-[920px]:py-2"
      data-testid="daily-closed"
    >
      <span
        class="serif flex size-14 shrink-0 items-center justify-center border-[1.5px] border-shu text-fs-36 text-shu"
        aria-hidden="true"
      >休</span>
      <span class="stamp-label">CLOSED · 店休日</span>
    </div>
    <div v-else class="flex flex-col gap-4">
      <ShiftRow type="day" :agents="schedule.day" :highlighted-agents="highlightedAgents" />
      <span class="h-px bg-rule-2" aria-hidden="true" />
      <ShiftRow
        type="night"
        :agents="schedule.night"
        :highlighted-agents="highlightedAgents"
      />
    </div>
  </article>
</template>
