<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui';
import { AGENTS } from '~~/shared/constant';

const selectedAgent = defineModel<{ label: string; name: string } | null>({ required: true });

const handleClear = () => {
  selectedAgent.value = null;
};

const agents: SelectMenuItem[] = [...AGENTS].map((item) => {
  return {
    label: item[1].name,
    name: item[0],
  };
});
</script>

<template>
  <div class="max-w-4xl mx-auto mb-8">
    <div
      class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div class="flex flex-col sm:flex-row gap-4 items-center">
        <div class="flex items-center gap-2 shrink-0">
          <UIcon name="i-heroicons-funnel" class="w-5 h-5 text-gray-500" />
          <span class="font-medium text-gray-700 dark:text-gray-300">探員篩選：</span>
        </div>
        <div class="flex-1 w-full sm:w-auto">
          <USelectMenu
            v-model="selectedAgent"
            :items="agents"
            placeholder="選擇探員..."
            size="lg"
            class="w-full"
          />
        </div>
        <UButton v-if="selectedAgent" color="neutral" variant="soft" size="lg" @click="handleClear">
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5 mr-1" />
          清除篩選
        </UButton>
      </div>

      <!-- Active Filter Display -->
      <div v-if="selectedAgent" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">目前顯示：</span>
          <UBadge color="primary" variant="subtle" size="lg">
            <UIcon name="i-heroicons-user" class="w-4 h-4" />
            {{ selectedAgent.label }}
          </UBadge>
          <span class="text-sm text-gray-600 dark:text-gray-400">的班表</span>
        </div>
      </div>
    </div>
  </div>
</template>
