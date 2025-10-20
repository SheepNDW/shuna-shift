<script setup lang="ts">
import { DATE_COLOR_MAP, NIGHT_SHIFT_COLOR_MAP } from '~/utils/colors';

const colorLegend = [
  { color: DATE_COLOR_MAP.SPECIAL_DAY, label: '一日限定', icon: 'i-heroicons-star' },
  { color: DATE_COLOR_MAP.EVENT_WEEK, label: '活動週', icon: 'i-heroicons-fire' },
  { color: DATE_COLOR_MAP.BIRTHDAY, label: '生誕祭/生誕出勤', icon: 'i-heroicons-cake' },
  { color: DATE_COLOR_MAP.CLOSED, label: '店休', icon: 'i-heroicons-x-circle' },
];

const shiftLegend = [
  { color: '', label: '早班', time: '13:30 ~ 17:30', icon: 'i-heroicons-sun' },
  {
    color: NIGHT_SHIFT_COLOR_MAP.GREEN_SHIFT,
    label: '晚班',
    time: '15:00 ~ 19:30',
    icon: 'i-heroicons-moon',
  },
  {
    color: NIGHT_SHIFT_COLOR_MAP.ORANGE_SHIFT,
    label: '晚班',
    time: '16:00 ~ 21:30',
    icon: 'i-heroicons-moon',
  },
  { color: '', label: '晚班', time: '17:30 ~ 21:30', icon: 'i-heroicons-moon' },
];

const specialLegend = [
  {
    color: '#ef4444',
    label: '紅字代班',
    description: '(括弧內為原本出勤的探員)',
    icon: 'i-heroicons-arrow-path',
  },
  {
    color: '#3b82f6',
    label: '藍字換班',
    description: '(括弧內為原本出勤的探員)',
    icon: 'i-heroicons-arrow-path-rounded-square',
  },
];
</script>

<template>
  <div class="mb-10">
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <!-- 日期顏色說明 -->
      <div class="flex items-center justify-center gap-2 mb-4">
        <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-purple-500" />
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">日期顏色說明</h3>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          v-for="item in colorLegend"
          :key="item.label"
          class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
            :style="{ backgroundColor: item.color }"
          >
            <UIcon :name="item.icon" class="w-4 h-4 text-gray-700 dark:text-gray-200" />
          </div>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ item.label }}
          </span>
        </div>
      </div>

      <!-- 分隔線 -->
      <div class="border-t border-gray-200 dark:border-gray-700 my-6" />

      <!-- 班別顏色說明 -->
      <div class="flex items-center justify-center gap-2 mb-4">
        <UIcon name="i-heroicons-clock" class="w-5 h-5 text-blue-500" />
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">班別顏色說明</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          v-for="item in shiftLegend"
          :key="item.label"
          class="flex flex-col gap-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
        >
          <div class="flex items-center gap-3">
            <UIcon :name="item.icon" class="w-5 h-5" :style="{ color: item.color }" />
            <span class="text-sm font-medium" :style="{ color: item.color }">
              {{ item.label }}
            </span>
          </div>
          <span class="text-xs ml-8" :style="{ color: item.color }">
            {{ item.time }}
          </span>
        </div>
      </div>

      <!-- 特殊說明 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in specialLegend"
          :key="item.label"
          class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
        >
          <UIcon :name="item.icon" class="w-5 h-5" :style="{ color: item.color }" />
          <div class="flex flex-col">
            <span class="text-sm font-medium" :style="{ color: item.color }">
              {{ item.label }}
            </span>
            <span class="text-xs text-gray-600 dark:text-gray-400">
              {{ item.description }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
