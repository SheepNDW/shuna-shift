<script setup lang="ts">
import type { AgentStatistics } from '~~/shared/types';

const props = defineProps<{
  statistics: AgentStatistics[];
}>();

type SortKey = 'name' | 'dayCount' | 'nightCount' | 'total';
type SortDirection = 'asc' | 'desc';

const sortKey = ref<SortKey>('total');
const sortDirection = ref<SortDirection>('desc');

const sortedStatistics = computed(() => {
  const data = [...props.statistics];

  return data.sort((a, b) => {
    let comparison = 0;

    if (sortKey.value === 'name') {
      comparison = a.name.localeCompare(b.name, 'zh-TW');
    } else {
      comparison = a[sortKey.value] - b[sortKey.value];
    }

    return sortDirection.value === 'desc' ? -comparison : comparison;
  });
});

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc';
  } else {
    sortKey.value = key;
    sortDirection.value = 'desc';
  }
}

function getSortIcon(key: SortKey): string {
  if (sortKey.value !== key) return 'i-heroicons-arrows-up-down';
  return sortDirection.value === 'desc' ? 'i-heroicons-arrow-down' : 'i-heroicons-arrow-up';
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100 dark:bg-gray-800">
          <th
            class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-12"
          >
            #
          </th>
          <th
            class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            @click="toggleSort('name')"
          >
            <div class="flex items-center gap-2">
              探員
              <UIcon :name="getSortIcon('name')" class="w-4 h-4" />
            </div>
          </th>
          <th
            class="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            @click="toggleSort('dayCount')"
          >
            <div class="flex items-center justify-center gap-2">
              <UIcon name="i-heroicons-sun" class="w-4 h-4 text-yellow-500" />
              日班
              <UIcon :name="getSortIcon('dayCount')" class="w-4 h-4" />
            </div>
          </th>
          <th
            class="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            @click="toggleSort('nightCount')"
          >
            <div class="flex items-center justify-center gap-2">
              <UIcon name="i-heroicons-moon" class="w-4 h-4 text-indigo-500" />
              晚班
              <UIcon :name="getSortIcon('nightCount')" class="w-4 h-4" />
            </div>
          </th>
          <th
            class="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            @click="toggleSort('total')"
          >
            <div class="flex items-center justify-center gap-2">
              總計
              <UIcon :name="getSortIcon('total')" class="w-4 h-4" />
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(stat, index) in sortedStatistics"
          :key="stat.agentId"
          class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          :class="{ 'bg-pink-50/50 dark:bg-pink-900/10': stat.isFullTime }"
        >
          <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
            {{ index + 1 }}
          </td>
          <td class="px-4 py-3">
            <NuxtLink
              :to="`/agents/${stat.agentId}`"
              class="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <NuxtImg
                :src="stat.picture"
                :alt="stat.name"
                class="w-10 h-10 rounded-full object-cover ring-2 ring-pink-200 dark:ring-pink-700"
                densities="x1"
                loading="lazy"
              />
              <span class="font-medium text-gray-900 dark:text-gray-100">
                {{ stat.name }}
              </span>
              <UBadge
                v-if="stat.isFullTime"
                color="primary"
                variant="subtle"
                size="xs"
                class="hidden sm:inline-flex"
              >
                正職
              </UBadge>
            </NuxtLink>
          </td>
          <td class="px-4 py-3 text-center">
            <span
              class="inline-flex items-center justify-center min-w-8 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium"
            >
              {{ stat.dayCount }}
            </span>
          </td>
          <td class="px-4 py-3 text-center">
            <span
              class="inline-flex items-center justify-center min-w-8 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium"
            >
              {{ stat.nightCount }}
            </span>
          </td>
          <td class="px-4 py-3 text-center">
            <span
              class="inline-flex items-center justify-center min-w-8 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm font-bold"
            >
              {{ stat.total }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="sortedStatistics.length === 0"
      class="text-center py-12 text-gray-500 dark:text-gray-400"
    >
      <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>沒有統計資料</p>
    </div>
  </div>
</template>
