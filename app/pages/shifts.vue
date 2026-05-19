<script setup lang="ts">
const scheduleStore = useScheduleStore();

const { schedules } = storeToRefs(scheduleStore);

// 探員篩選
type SelectedAgent = { label: string; name: string };
const selectedAgent = ref<SelectedAgent[]>([]);
const hasAgentFilter = computed(() => selectedAgent.value.length > 0);
const selectedAgentNames = computed(() =>
  selectedAgent.value.map((agent) => agent.label).join('、')
);

// 高亮探員名稱集合
const highlightedAgentNames = computed(
  () => new Set(selectedAgent.value.map((agent) => agent.name))
);

const filteredSchedules = computed(() => {
  const futureSchedules = schedules.value.filter((schedule) =>
    isTodayOrFuture(schedule.date.datetime)
  );

  if (!hasAgentFilter.value) return futureSchedules;

  // 只保留「有選中探員值班」的日期，但保留該日期所有探員
  return futureSchedules.filter(
    (schedule) =>
      schedule.day.some((agent) => highlightedAgentNames.value.has(agent.name)) ||
      schedule.night.some((agent) => highlightedAgentNames.value.has(agent.name))
  );
});

// 日期快速跳轉
const availableDates = computed(() =>
  filteredSchedules.value.map((schedule) => ({
    label: schedule.date.datetime,
    value: schedule.date.datetime,
  }))
);

function scrollToDate(datetime: string) {
  const element = document.getElementById(`schedule-${datetime}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const appConfig = useAppConfig();
useHead({
  title: `${appConfig.title} - 完整班表`,
});
</script>

<template>
  <UContainer class="py-8 md:py-12">
    <PageHeader
      kanji="表"
      label="SHIFT TIMETABLE · 班表"
      title="完整班表"
      subtitle="查看表單最近已排班日期的值班安排"
    />

    <ClientOnly>
      <!-- Schedule Filter & Date Jump -->
      <div class="max-w-4xl mx-auto mb-8">
        <div
          class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200"
        >
          <div class="flex flex-col sm:flex-row gap-4 sm:items-start">
            <!-- Agent Filter -->
            <ScheduleFilter v-model="selectedAgent" class="flex-1" />

            <!-- Date Quick Jump -->
            <DateJumper :dates="availableDates" @jump="scrollToDate" />
          </div>
        </div>
      </div>

      <!-- Schedules List -->
      <div v-if="filteredSchedules && filteredSchedules.length > 0" class="max-w-6xl mx-auto">
        <DailyScheduleCard
          v-for="schedule in filteredSchedules"
          :id="`schedule-${schedule.date.datetime}`"
          :key="schedule.date.datetime"
          :schedule="schedule"
          :highlighted-agents="hasAgentFilter ? highlightedAgentNames : undefined"
        />

        <!-- Color Legend -->
        <div class="mt-12">
          <ColorLegend />
        </div>
      </div>

      <!-- Empty State (when filter returns no results) -->
      <div
        v-else-if="hasAgentFilter"
        class="flex flex-col items-center justify-center py-20 max-w-2xl mx-auto"
      >
        <div
          class="bg-white rounded-3xl p-12 shadow-xl text-center border-4 border-dashed border-gray-300"
        >
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
          />
          <h3 class="text-2xl font-bold text-gray-700 mb-2">找不到班表</h3>
          <p class="text-gray-600 mb-6">
            探員 <strong>{{ selectedAgentNames }}</strong> 在近期沒有排班記錄
          </p>
          <UButton color="primary" size="lg" @click="selectedAgent = []">
            <UIcon name="i-heroicons-arrow-path" class="w-5 h-5" />
            查看所有班表
          </UButton>
        </div>
      </div>

      <!-- Empty State (no future schedules) -->
      <div v-else class="flex flex-col items-center justify-center py-20 max-w-2xl mx-auto">
        <div
          class="bg-white rounded-3xl p-12 shadow-xl text-center border-4 border-dashed border-gray-300"
        >
          <UIcon
            name="i-heroicons-calendar-days"
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
          />
          <h3 class="text-2xl font-bold text-gray-700 mb-2">沒有未來班表</h3>
          <p class="text-gray-600">目前沒有已排定的未來班表資料</p>
        </div>
      </div>

      <template #fallback>
        <LoadingState />
      </template>
    </ClientOnly>
  </UContainer>
</template>
