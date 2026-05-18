<script setup lang="ts">
import type { StatisticsResponse } from '~~/shared/types';

const TWO_HOURS = 2 * 60 * 60 * 1000;

const { data, status } = await useFetch<StatisticsResponse>('/api/statistics', {
  getCachedData(key, nuxtApp) {
    const cached = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    if (!cached) return undefined;

    const fetchedAt = new Date(cached.metadata?.lastUpdated).getTime();
    if (Number.isNaN(fetchedAt) || Date.now() - fetchedAt > TWO_HOURS) {
      return undefined;
    }

    return cached;
  },
});

const appConfig = useAppConfig();
useHead({
  title: `${appConfig.title} - 值班統計`,
  meta: [
    {
      name: 'description',
      content: '查看喫茶 朱雫 Maid Café 探員近期的值班統計資料',
    },
  ],
});
</script>

<template>
  <UContainer class="py-8 md:py-12">
    <!-- Header -->
    <div class="text-center mb-12">
      <div
        class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-4"
      >
        <UIcon
          name="i-heroicons-chart-bar"
          class="w-5 h-5 text-emerald-600 "
        />
        <span class="text-sm font-medium text-emerald-700 ">排班紀錄</span>
      </div>
      <h1
        class="text-4xl md:text-5xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3"
      >
        出勤統計
      </h1>
      <p class="text-gray-600 text-lg">近期排班紀錄</p>
    </div>

    <!-- Loading State -->
    <LoadingState v-if="status === 'pending'" message="載入統計資料中..." />

    <!-- Content -->
    <div v-else-if="data" class="max-w-4xl mx-auto">
      <!-- Metadata Card -->
      <div
        class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 mb-8"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center"
            >
              <UIcon
                name="i-heroicons-calendar-days"
                class="w-6 h-6 text-emerald-600 "
              />
            </div>
            <div>
              <p class="text-sm text-gray-500 ">統計期間</p>
              <p class="font-semibold text-gray-900 ">
                {{ data.metadata.dateRange.from }} ~ {{ data.metadata.dateRange.to }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center"
            >
              <UIcon
                name="i-heroicons-document-text"
                class="w-6 h-6 text-purple-600 "
              />
            </div>
            <div>
              <p class="text-sm text-gray-500 ">統計天數</p>
              <p class="font-semibold text-gray-900 ">
                {{ data.metadata.totalSchedules }} 天
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Table -->
      <div
        class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
      >
        <div class="p-4 border-b border-gray-200 ">
          <h2
            class="text-lg font-semibold text-gray-900 flex items-center gap-2"
          >
            <UIcon name="i-heroicons-users" class="w-5 h-5 text-pink-500" />
            探員排班統計
          </h2>
          <p class="text-sm text-gray-500 mt-1">點擊欄位標題可進行排序</p>
        </div>
        <StatisticsTable :statistics="data.statistics" />
      </div>

      <!-- Legend -->
      <div class="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
        <div class="flex items-center gap-2">
          <span
            class="w-4 h-4 rounded bg-pink-50 border border-pink-200 "
          />
          <span class="text-gray-600 ">正職探員</span>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full text-xs"
          >
            N
          </span>
          <span class="text-gray-600 ">日班次數</span>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full text-xs"
          >
            N
          </span>
          <span class="text-gray-600 ">晚班次數</span>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-20 text-gray-500 "
    >
      <UIcon name="i-heroicons-exclamation-circle" class="w-16 h-16 mb-4 text-red-400" />
      <p class="text-lg">無法載入統計資料</p>
      <p class="text-sm mt-2">請稍後再試</p>
    </div>
  </UContainer>
</template>
