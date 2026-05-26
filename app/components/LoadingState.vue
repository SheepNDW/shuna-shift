<script setup lang="ts">
// 載入中骨架:數條紙感佔位塊 + serif 提示文字。
const { message = '資料載入中…' } = defineProps<{
  /** 載入提示文字 */
  message?: string;
}>();
</script>

<template>
  <div
    class="flex flex-col items-center gap-6 py-20"
    role="status"
    data-testid="loading-state"
  >
    <div class="flex w-full max-w-md flex-col gap-3" aria-hidden="true">
      <div class="h-3 w-1/3 rounded-sm bg-rule-2 motion-safe:animate-pulse" />
      <div class="h-14 w-full rounded-lg bg-rule-2 motion-safe:animate-pulse" />
      <div class="h-14 w-full rounded-lg bg-rule-2 motion-safe:animate-pulse" />
    </div>
    <p class="serif text-fs-18 text-ink-soft">{{ message }}</p>
  </div>
</template>
