<script setup lang="ts">
const props = defineProps<{
  agentInfo: Agent;
}>();

const hasPhotos = computed(() => (props.agentInfo.photos ?? []).filter(Boolean).length > 0);
</script>

<template>
  <div class="mx-auto mb-12 max-w-3xl space-y-6">
    <div class="flex flex-col items-center">
      <div class="relative mb-6 h-40 w-40 md:h-48 md:w-48">
        <div
          class="h-full w-full overflow-hidden rounded-full bg-linear-to-br from-pink-200 to-purple-200 ring-4 ring-pink-100 transition-all hover:ring-pink-300"
        >
          <NuxtImg
            :src="agentInfo.picture"
            :alt="agentInfo.name"
            class="h-full w-full object-cover"
          />
        </div>
        <div
          class="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 shadow-lg border-4 border-white"
        >
          <UIcon name="i-heroicons-star-solid" class="h-6 w-6 text-white" />
        </div>
      </div>

      <h1
        class="mb-4 text-4xl font-bold bg-linear-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
      >
        {{ agentInfo.name }}
      </h1>

      <a
        v-if="agentInfo.instagram"
        :href="agentInfo.instagram"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 rounded-full bg-linear-to-r from-pink-500 to-purple-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:from-pink-600 hover:to-purple-600 hover:shadow-lg"
      >
        <UIcon name="i-mdi-instagram" class="h-5 w-5" />
        <span>Instagram</span>
      </a>
    </div>

    <UCard v-if="hasPhotos" data-testid="agent-photo-section">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-photo" class="h-5 w-5 text-pink-500" />
          <h2 class="text-lg font-semibold text-gray-800">照片</h2>
        </div>
      </template>

      <AgentPhotoCarousel :photos="agentInfo.photos" :agent-name="agentInfo.name" />
    </UCard>
  </div>
</template>
