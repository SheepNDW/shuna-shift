<script setup lang="ts">
const scheduleStore = useScheduleStore();

const { schedules } = storeToRefs(scheduleStore);

// 探員篩選
const selectedAgent = ref<{ label: string; name: string } | null>(null);

const filteredSchedules = computed(() => {
  const futureSchedules = schedules.value.filter((schedule) =>
    isTodayOrFuture(schedule.date.datetime)
  );

  if (!selectedAgent.value) return futureSchedules;

  return futureSchedules
    .map((schedule) => ({
      ...schedule,
      day: schedule.day.filter((agent) => agent.name === selectedAgent.value?.name),
      night: schedule.night.filter((agent) => agent.name === selectedAgent.value?.name),
    }))
    .filter((schedule) => schedule.day.length > 0 || schedule.night.length > 0);
});

const appConfig = useAppConfig();
useHead({
  title: `${appConfig.title} - 完整班表`,
});
</script>

<template>
  <div
    class="min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
  >
    <UContainer class="py-8 md:py-12">
      <!-- Header -->
      <div class="text-center mb-12">
        <div
          class="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4"
        >
          <UIcon
            name="i-heroicons-calendar-days"
            class="w-5 h-5 text-purple-600 dark:text-purple-400"
          />
          <span class="text-sm font-medium text-purple-700 dark:text-purple-300">完整排班資訊</span>
        </div>
        <h1
          class="text-4xl md:text-5xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3"
        >
          完整班表
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          查看表單最近 20 天已排班日期的值班安排
        </p>
      </div>

      <!-- Schedule Filter -->
      <ScheduleFilter v-model="selectedAgent" />

      <!-- Schedules List -->
      <div v-if="filteredSchedules && filteredSchedules.length > 0" class="max-w-6xl mx-auto">
        <DailyScheduleCard
          v-for="schedule in filteredSchedules"
          :key="schedule.date.datetime"
          :schedule="schedule"
        />

        <!-- Color Legend -->
        <div class="mt-12">
          <ColorLegend />
        </div>
      </div>

      <!-- Empty State (when filter returns no results) -->
      <div
        v-else-if="selectedAgent"
        class="flex flex-col items-center justify-center py-20 max-w-2xl mx-auto"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-xl text-center border-4 border-dashed border-gray-300 dark:border-gray-600"
        >
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4"
          />
          <h3 class="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">找不到班表</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            探員 <strong>{{ selectedAgent.name }}</strong> 在近期沒有排班記錄
          </p>
          <UButton color="primary" size="lg" @click="selectedAgent = null">
            <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 mr-2" />
            查看所有班表
          </UButton>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="flex flex-col items-center justify-center py-20">
        <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p class="text-gray-600 dark:text-gray-400">載入班表中...</p>
      </div>
    </UContainer>

    <!-- Back to Top Button -->
    <BackToTop />
  </div>
</template>
