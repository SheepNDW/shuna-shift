<!--
  朱雫 — app.vue
  貼到：app/app.vue

  變更：補上 Google Fonts 載入（Noto Serif TC / Noto Sans TC / JetBrains Mono）
-->
<script setup lang="ts">
const scheduleStore = useScheduleStore();

const { fetchSchedules } = scheduleStore;
await callOnce('fetchSchedules', () => fetchSchedules());

// 字型載入 — 直接走 Google Fonts CDN
// 若日後有 @nuxt/fonts 模組可改用之，效能更佳
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
    },
  ],
});
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
