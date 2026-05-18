<script setup lang="ts">
import type { AgentStatistics } from '~~/shared/types';

const props = defineProps<{
  statistics: AgentStatistics[];
}>();

type SortKey = 'dayCount' | 'nightCount' | 'total';
type SortDirection = 'asc' | 'desc';

const sortKey = ref<SortKey>('total');
const sortDirection = ref<SortDirection>('desc');

const sortedStatistics = computed(() => {
  return props.statistics.toSorted((a, b) => {
    const comparison = a[sortKey.value] - b[sortKey.value];
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
  <div class="p-4">
    <!-- Header -->
    <div
      class="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] items-center gap-2 sm:gap-3 p-3 mb-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 "
    >
      <!-- Rank -->
      <span class="text-center">#</span>

      <!-- Agent -->
      <span>探員</span>

      <!-- Day Count -->
      <button
        class="flex items-center justify-center gap-1 hover:text-gray-900 :text-gray-100 transition-colors"
        @click="toggleSort('dayCount')"
      >
        <UIcon name="i-heroicons-sun" class="w-4 h-4 text-yellow-500" />
        <span class="hidden sm:inline">日班</span>
        <UIcon :name="getSortIcon('dayCount')" class="w-3 h-3 sm:w-4 sm:h-4" />
      </button>

      <!-- Night Count -->
      <button
        class="flex items-center justify-center gap-1 hover:text-gray-900 :text-gray-100 transition-colors"
        @click="toggleSort('nightCount')"
      >
        <UIcon name="i-heroicons-moon" class="w-4 h-4 text-indigo-500" />
        <span class="hidden sm:inline">晚班</span>
        <UIcon :name="getSortIcon('nightCount')" class="w-3 h-3 sm:w-4 sm:h-4" />
      </button>

      <!-- Total -->
      <button
        class="flex items-center justify-center gap-1 hover:text-gray-900 :text-gray-100 transition-colors"
        @click="toggleSort('total')"
      >
        <span class="hidden sm:inline">總計</span>
        <span class="sm:hidden">總</span>
        <UIcon :name="getSortIcon('total')" class="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </div>

    <!-- Grid Layout -->
    <div class="grid gap-2 sm:gap-3">
      <NuxtLink
        v-for="(stat, index) in sortedStatistics"
        :key="stat.agentId"
        :to="`/agents/${stat.agentId}`"
        :class="[
          'grid grid-cols-[1fr_2fr_1fr_1fr_1fr] items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-colors',
          stat.isFullTime
            ? 'border-pink-200 bg-pink-50 hover:bg-pink-100 :bg-pink-900/20'
            : 'border-gray-200 hover:bg-gray-50 :bg-gray-800/50',
        ]"
      >
        <!-- Rank -->
        <span class="text-sm text-gray-500 text-center">
          {{ index + 1 }}
        </span>

        <!-- Agent Info -->
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          <NuxtImg
            :src="stat.picture"
            :alt="stat.name"
            class="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-pink-200 shrink-0"
            densities="x1"
            loading="lazy"
          />
          <span class="font-medium text-gray-900 truncate text-sm sm:text-base">
            {{ stat.name }}
          </span>
        </div>

        <!-- Day Count -->
        <span
          class="inline-flex items-center justify-center min-w-6 sm:min-w-8 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs sm:text-sm font-medium"
        >
          {{ stat.dayCount }}
        </span>

        <!-- Night Count -->
        <span
          class="inline-flex items-center justify-center min-w-6 sm:min-w-8 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs sm:text-sm font-medium"
        >
          {{ stat.nightCount }}
        </span>

        <!-- Total -->
        <span
          class="inline-flex items-center justify-center min-w-6 sm:min-w-8 px-2 sm:px-3 py-0.5 sm:py-1 bg-pink-100 text-pink-700 rounded-full text-xs sm:text-sm font-bold"
        >
          {{ stat.total }}
        </span>
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div
      v-if="sortedStatistics.length === 0"
      class="text-center py-12 text-gray-500 "
    >
      <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>沒有統計資料</p>
    </div>
  </div>
</template>
