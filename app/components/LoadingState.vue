<script setup lang="ts">
const { message = '載入班表中...' } = defineProps<{
  message?: string;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20">
    <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 text-pink-500 animate-spin mb-4" />
    <p class="text-gray-600 dark:text-gray-400">{{ message }}</p>
  </div>
</template>
