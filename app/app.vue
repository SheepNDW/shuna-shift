<script setup lang="ts">
// 這裡不再預抓班表：`useSchedules()` 全站共用同一個 asyncData key，第一個
// `await` 到的呼叫端（layout 的 AppFooter，或需要班表的頁面）就會發出唯一那次
// 請求，其餘直接接上。原本的 `callOnce` 是為了避免重複請求，現在由 key 本身保證。

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
