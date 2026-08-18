<script setup lang="ts">
defineProps<{
  photos: string[];
  agentName: string;
}>();

const { hasFailed, onImageError } = useImageFallback();
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
        class="aspect-square w-full overflow-hidden rounded-lg border border-rule bg-paper-2"
      >
        <NuxtImg
          v-if="!hasFailed(item)"
          :src="item"
          :alt="`${agentName} 照片 ${index + 1}`"
          width="448"
          height="448"
          class="h-full w-full object-cover"
          loading="lazy"
          data-testid="agent-photo-image"
          @error="onImageError(item)"
        />
        <span
          v-else
          class="flex h-full w-full items-center justify-center text-fs-14 text-ink-mute"
          data-testid="agent-photo-fallback"
        >照片暫時無法載入</span>
      </div>
    </div>
  </UCarousel>
</template>
