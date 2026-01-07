<script setup lang="ts">
defineProps<{
  photos: string[];
  agentName: string;
}>();
</script>

<template>
  <UCarousel
    v-slot="{ item, index }"
    :items="photos"
    :arrows="true"
    class="mx-auto w-full max-w-sm sm:max-w-md"
    :ui="{
      root: 'relative',
      viewport: 'px-0 sm:px-5',
      prev: 'hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2',
      next: 'hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2',
    }"
  >
    <div class="px-1">
      <div
        class="aspect-square w-full overflow-hidden rounded-2xl bg-linear-to-br from-pink-200 to-purple-200 dark:from-pink-900 dark:to-purple-900"
      >
        <NuxtImg
          :src="item"
          :alt="`${agentName} 照片 ${index + 1}`"
          class="h-full w-full object-cover"
          loading="lazy"
          data-testid="agent-photo-image"
        />
      </div>
    </div>
  </UCarousel>
</template>
