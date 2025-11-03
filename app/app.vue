<script setup lang="ts">
const scheduleStore = useScheduleStore();

const { fetchSchedules } = scheduleStore;
await callOnce('fetchSchedules', () => fetchSchedules());
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
