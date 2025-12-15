<script setup lang="ts">
const greeting = computed(() => {
  const currentHour = getCurrentHour();
  if (currentHour >= 5 && currentHour < 12) return '早安';
  if (currentHour >= 12 && currentHour < 18) return '午安';
  return '晚安';
});
</script>

<template>
  <ClientOnly>
    <div class="text-center mb-12">
      <div
        class="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900/30 rounded-full mb-4"
      >
        <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-pink-600 dark:text-pink-400" />
        <span class="text-sm font-medium text-pink-700 dark:text-pink-300"
          >{{ greeting }}前輩，歡迎回來！</span
        >
      </div>
      <h2
        class="text-4xl md:text-5xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3"
      >
        今日班表
      </h2>
      <p class="text-gray-600 dark:text-gray-400 text-lg">查看今日值班的探員們</p>
    </div>
  </ClientOnly>
</template>
