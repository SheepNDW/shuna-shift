<script setup lang="ts">
// 班次圖示：早班為太陽、晚班為月亮。
// 採 inline SVG（stroke 1.5、currentColor），由父層容器決定尺寸與顏色。
// 圖示為裝飾性，文字「早班」「晚班」永遠由父層另行提供。
defineProps<{
  type: 'day' | 'night';
}>();
</script>

<template>
  <svg
    v-if="type === 'day'"
    class="block h-full w-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path
      d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2.1 2.1M17.4 17.4l2.1 2.1M19.5 4.5l-2.1 2.1M6.6 17.4l-2.1 2.1"
    />
  </svg>
  <svg
    v-else
    class="block h-full w-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />
  </svg>
</template>
