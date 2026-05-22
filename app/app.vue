<script setup lang="ts">
const scheduleStore = useScheduleStore();

const { fetchSchedules } = scheduleStore;
await callOnce('fetchSchedules', () => fetchSchedules());

// 字型由 @nuxt/fonts 模組處理（build 時 self-host，設定見 nuxt.config.ts）。
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
