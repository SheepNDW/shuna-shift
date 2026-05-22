<script setup lang="ts">
// 各頁共用頁首：漢字圖章 + romaji 標籤 + 髮絲線 + 右側 meta + serif 大標 + 副標。
// 取代過去各頁手刻的「pill + 漸層大標 + 副標」三件組。
defineProps<{
  /** 漢字圖章（單字），如「表」「員」「計」 */
  kanji: string;
  /** romaji / 分類小標，如「SHIFT TIMETABLE · 班表」 */
  label: string;
  /** serif 頁面大標 */
  title: string;
  /** 選填副標 */
  subtitle?: string;
  /** 選填右側 meta 文字（髮絲線尾端） */
  meta?: string;
}>();
</script>

<template>
  <header class="mb-12">
    <div class="mb-4 flex items-center gap-3">
      <span class="kanji-mark serif" aria-hidden="true">{{ kanji }}</span>
      <span class="stamp-label">{{ label }}</span>
      <span class="h-px flex-1 bg-rule" />
      <span v-if="meta" class="stamp-label" data-testid="page-header-meta">{{ meta }}</span>
    </div>
    <h1
      class="serif text-fs-64 tracking-[-0.01em] text-ink max-[920px]:text-fs-48"
      data-testid="page-header-title"
    >{{ title }}</h1>
    <p
      v-if="subtitle"
      class="mt-3 text-fs-16 text-ink-soft"
      data-testid="page-header-subtitle"
    >{{ subtitle }}</p>
  </header>
</template>
