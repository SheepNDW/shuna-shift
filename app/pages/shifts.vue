<script setup lang="ts">
const scheduleStore = useScheduleStore();

const { schedules } = storeToRefs(scheduleStore);

const appConfig = useAppConfig();
useHead({
  title: `${appConfig.title} - 完整班表`,
});
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-4xl font-bold mb-8 text-center">完整班表</h1>

    <div v-if="schedules && schedules.length > 0" class="space-y-6">
      <p class="text-center text-gray-600 dark:text-gray-400">班表內容開發中...</p>
    </div>
  </UContainer>
</template>
