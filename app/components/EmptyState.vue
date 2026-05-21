<script setup lang="ts">
// 統一空狀態:大漢字圖章 + serif 標題 + 選填副標 + 選填 action slot。
// 取代全站各頁手刻的 empty state(首頁無排班 / shifts / agents / 探員頁 / 統計)。
defineProps<{
  /** 大漢字圖章,如「空」「無」「休」;未提供時預設「空」 */
  kanji?: string;
  /** serif 主標題 */
  title: string;
  /** 選填副標說明文字 */
  subtitle?: string;
}>();
</script>

<template>
  <div
    class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-rule px-6 py-16 text-center"
    data-testid="empty-state"
  >
    <span class="empty-kanji" aria-hidden="true">{{ kanji || '空' }}</span>
    <h2 class="serif text-fs-28 text-ink" data-testid="empty-state-title">{{ title }}</h2>
    <p
      v-if="subtitle"
      class="max-w-[36ch] text-ink-soft"
      data-testid="empty-state-subtitle"
    >
      {{ subtitle }}
    </p>
    <div v-if="$slots.action" class="mt-4" data-testid="empty-state-action">
      <slot name="action" />
    </div>
  </div>
</template>
