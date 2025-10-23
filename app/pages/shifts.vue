<script setup lang="ts">
const scheduleStore = useScheduleStore();

const { schedules } = storeToRefs(scheduleStore);

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const appConfig = useAppConfig();
useHead({
  title: `${appConfig.title} - 完整班表`,
});
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
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
          class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3"
        >
          完整班表
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-lg">查看所有已排班日期的值班安排</p>
      </div>

      <!-- Schedules List -->
      <div v-if="schedules && schedules.length > 0" class="max-w-6xl mx-auto">
        <DailyScheduleCard
          v-for="schedule in schedules"
          :key="schedule.date.datetime"
          :schedule="schedule"
        />

        <!-- Color Legend -->
        <div class="mt-12">
          <ColorLegend />
        </div>

        <!-- Back to Top -->
        <div class="text-center mt-12">
          <UButton color="neutral" variant="soft" size="xl" @click="scrollToTop">
            <UIcon name="i-heroicons-arrow-up" class="w-5 h-5 mr-2" />
            回到頂部
          </UButton>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="flex flex-col items-center justify-center py-20">
        <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p class="text-gray-600 dark:text-gray-400">載入班表中...</p>
      </div>
    </UContainer>
  </div>
</template>
