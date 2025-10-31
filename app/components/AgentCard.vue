<script setup lang="ts">
import { AGENTS } from '~~/shared/constant';

const { name, textColor } = defineProps<{ name: string; textColor: string }>();

const getAgentInfo = (name: string) => {
  let searchName = name;

  if (name.includes('(')) {
    searchName = name.split('(')[0]?.trim() || name;
  }

  return AGENTS.get(searchName) || { id: '', name, picture: '', instagram: '' };
};

const agentInfo = computed(() => {
  const info = getAgentInfo(name);

  return {
    id: info.id,
    name: name.includes('(') ? name : info.name,
    picture: info.picture,
    instagram: info.instagram,
    textColor: textColor || '',
  };
});
</script>

<template>
  <NuxtLink
    :to="`/agents/${agentInfo.id}`"
    class="group flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 cursor-pointer"
  >
    <div class="relative w-28 h-28 mb-4">
      <div
        class="w-full h-full overflow-hidden rounded-full bg-linear-to-br from-pink-200 to-purple-200 dark:from-pink-900 dark:to-purple-900 ring-4 ring-pink-100 dark:ring-pink-900/50 group-hover:ring-pink-300 dark:group-hover:ring-pink-700 transition-all"
      >
        <NuxtImg
          :src="agentInfo.picture"
          :alt="agentInfo.name"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        class="absolute -bottom-1 -right-1 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800"
      >
        <UIcon name="i-heroicons-star-solid" class="w-4 h-4 text-white" />
      </div>
    </div>
    <p class="font-bold text-xl mb-2" :style="{ color: agentInfo.textColor || 'inherit' }">
      {{ agentInfo.name }}
    </p>
    <a
      v-if="agentInfo.instagram"
      :href="agentInfo.instagram"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-2 flex items-center gap-1 px-3 py-1 rounded-full bg-linear-to-r from-pink-500 to-purple-500 text-white text-sm font-medium hover:from-pink-600 hover:to-purple-600 transition-all cursor-pointer"
      @click.stop
    >
      <UIcon name="i-mdi-instagram" class="w-4 h-4" />
      <span>Instagram</span>
    </a>
  </NuxtLink>
</template>
