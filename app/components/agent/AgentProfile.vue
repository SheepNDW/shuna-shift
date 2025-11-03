<script setup lang="ts">
defineProps<{
  agentInfo: Agent;
}>();
</script>

<template>
  <div class="flex flex-col items-center mb-12">
    <div class="relative w-40 h-40 md:w-48 md:h-48 mb-6">
      <div
        class="w-full h-full overflow-hidden rounded-full bg-linear-to-br from-pink-200 to-purple-200 dark:from-pink-900 dark:to-purple-900 ring-4 ring-pink-100 dark:ring-pink-900/50 hover:ring-pink-300 dark:hover:ring-pink-700 transition-all"
      >
        <NuxtImg
          :src="agentInfo.picture"
          :alt="agentInfo.name"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        class="absolute -bottom-2 -right-2 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800"
      >
        <UIcon name="i-heroicons-star-solid" class="w-6 h-6 text-white" />
      </div>
    </div>

    <h1
      class="text-4xl font-bold mb-4 bg-linear-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
    >
      {{ agentInfo.name }}
    </h1>

    <a
      v-if="agentInfo.instagram"
      :href="agentInfo.instagram"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-pink-500 to-purple-500 text-white font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
    >
      <UIcon name="i-mdi-instagram" class="w-5 h-5" />
      <span>Instagram</span>
    </a>
  </div>
</template>
