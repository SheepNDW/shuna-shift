<script setup lang="ts">
defineProps<{
  date: AgentScheduleItem['date'];
}>();

// 判斷日期特殊事件
const getDateEventInfo = (backgroundColor: string) => {
  const eventMap = {
    [DATE_COLOR_MAP.SPECIAL_DAY]: { icon: 'i-heroicons-star', label: '一日限定' },
    [DATE_COLOR_MAP.EVENT_WEEK]: { icon: 'i-heroicons-fire', label: '活動週' },
    [DATE_COLOR_MAP.BIRTHDAY]: { icon: 'i-heroicons-cake', label: '生誕祭/生誕出勤' },
  };

  return eventMap[backgroundColor] || null;
};
</script>

<template>
  <div class="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center gap-2 flex-wrap">
      <h3
        class="text-lg font-bold"
        :class="getDateEventInfo(date.backgroundColor) ? '' : 'text-gray-800 dark:text-gray-200'"
        :style="getDateEventInfo(date.backgroundColor) ? { color: date.backgroundColor } : {}"
      >
        {{ date.datetime }}
      </h3>
      <!-- 特殊事件圖示 -->
      <template v-if="getDateEventInfo(date.backgroundColor)">
        <UIcon
          :name="getDateEventInfo(date.backgroundColor)!.icon"
          class="w-5 h-5"
          :style="{ color: date.backgroundColor }"
        />
        <span class="text-sm font-bold" :style="{ color: date.backgroundColor }">
          {{ getDateEventInfo(date.backgroundColor)!.label }}
        </span>
      </template>
    </div>
    <p
      v-if="date.description"
      class="text-sm mt-1 font-bold"
      :class="getDateEventInfo(date.backgroundColor) ? '' : 'text-gray-600 dark:text-gray-400'"
      :style="getDateEventInfo(date.backgroundColor) ? { color: date.backgroundColor } : {}"
    >
      {{ date.description }}
    </p>
  </div>
</template>
