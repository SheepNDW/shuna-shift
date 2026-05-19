<script setup lang="ts">
// 班表單日卡：左側 DateTag、右側早 / 晚班 ShiftRow。
// 今日卡套用 .daily-card-today（朱紅邊框 + 左側朱紅實線，見 components.css）。
const {
  schedule,
  highlightedAgents = undefined,
} = defineProps<{
  schedule: ShiftSchedule;
  /** 篩選高亮的探員名稱集合；傳遞給 ShiftRow */
  highlightedAgents?: Set<string>;
}>();

const today = computed(() => isToday(schedule.date.datetime));
</script>

<template>
  <article
    class="grid grid-cols-[200px_1fr] gap-8 rounded-lg border border-rule bg-surface p-6 max-[920px]:grid-cols-1 max-[920px]:gap-4"
    :class="{ 'daily-card-today': today }"
    data-testid="daily-schedule-card"
    :data-today="today"
  >
    <div
      class="border-r border-rule-2 pr-6 max-[920px]:border-r-0 max-[920px]:border-b max-[920px]:pr-0 max-[920px]:pb-4"
    >
      <DateTag
        :datetime="schedule.date.datetime"
        :is-today="today"
        :description="schedule.date.description"
      />
    </div>

    <div class="flex flex-col gap-4">
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
