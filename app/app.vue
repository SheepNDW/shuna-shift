<script setup lang="ts">
const scheduleStore = useScheduleStore();

const { fetchSchedules } = scheduleStore;
await fetchSchedules();
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
