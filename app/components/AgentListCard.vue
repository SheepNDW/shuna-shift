<script setup lang="ts">
import { computed } from 'vue';
import type { Agent } from '~~/shared/types';

const props = defineProps<{
  agent: Agent;
}>();

const isFullTime = computed(() => props.agent.isFullTime === true);

const cardClasses = computed(() =>
  isFullTime.value
    ? 'group relative flex flex-col items-center p-6 rounded-3xl shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-linear-to-br from-white to-pink-50 border-2 border-transparent bg-clip-padding'
    : 'group relative flex flex-col items-center p-6 bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100'
);

const outerBorderClasses = computed(() =>
  isFullTime.value
    ? 'absolute inset-0 rounded-3xl bg-linear-to-r from-yellow-400 to-orange-400 opacity-100 pointer-events-none -z-10'
    : 'hidden'
);

const avatarWrapperClasses = computed(() =>
  isFullTime.value
    ? 'relative w-32 h-32 mb-4 flex items-center justify-center'
    : 'relative w-28 h-28 mb-4 flex items-center justify-center'
);

const avatarRingClasses = computed(() =>
  isFullTime.value
    ? 'w-full h-full overflow-hidden rounded-full bg-linear-to-br from-yellow-200 via-pink-100 to-orange-100 ring-4 ring-yellow-200 shadow-lg'
    : 'w-full h-full overflow-hidden rounded-full bg-linear-to-br from-pink-200 to-purple-200 ring-4 ring-pink-100 group-hover:ring-pink-300 transition-all'
);

const starClasses = computed(() =>
  isFullTime.value
    ? 'absolute -bottom-1 -right-1 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white'
    : 'absolute -bottom-1 -right-1 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white'
);

const nameClasses = computed(() =>
  isFullTime.value
    ? 'font-extrabold text-2xl text-gray-800 text-center'
    : 'font-bold text-xl text-gray-800 text-center'
);

const instagramButtonClasses = computed(() =>
  isFullTime.value
    ? 'mt-3 flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-yellow-400 via-pink-500 to-purple-500 text-white text-sm font-semibold hover:from-yellow-500 hover:via-pink-600 hover:to-purple-600 transition-all'
    : 'mt-2 flex items-center gap-1 px-3 py-1 rounded-full bg-linear-to-r from-pink-500 to-purple-500 text-white text-sm font-medium hover:from-pink-600 hover:to-purple-600 transition-all cursor-pointer'
);
</script>

<template>
  <div class="relative" data-testid="agent-list-card">
    <div :class="outerBorderClasses" aria-hidden="true" />
    <div class="relative" :class="cardClasses">
      <NuxtLink :to="`/agents/${agent.id}`" data-testid="agent-card-link">
        <div :class="avatarWrapperClasses">
          <div :class="avatarRingClasses">
            <NuxtImg
              :src="agent.picture"
              :alt="`${agent.name} 的照片`"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div :class="starClasses">
            <UIcon
              :name="isFullTime ? 'i-heroicons-star-solid' : 'i-heroicons-sparkles'"
              class="text-white"
              :class="isFullTime ? 'w-5 h-5' : 'w-4 h-4'"
            />
          </div>
        </div>
      </NuxtLink>

      <p :class="nameClasses">{{ agent.name }}</p>

      <a
        v-if="agent.instagram"
        :href="agent.instagram"
        target="_blank"
        rel="noopener noreferrer"
        :class="instagramButtonClasses"
        aria-label="前往 Instagram"
        data-testid="instagram-link"
      >
        <UIcon name="i-mdi-instagram" :class="isFullTime ? 'w-5 h-5' : 'w-4 h-4'" />
        <span>Instagram</span>
      </a>
    </div>
  </div>
</template>
