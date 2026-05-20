<script setup lang="ts">
// 詳情頁頁首返回列:左側「← 回上層」連結 + 右側可選 stamp-label 分類標籤。
// 取代 /agents/[id] 頁原本的大型 UButton「返回上一頁」+ 漸層元件。
defineProps<{
  /** 上層路徑(NuxtLink 的 to) */
  to: string;
  /** 連結文字,如「探員圖鑑」 */
  label: string;
  /** 可選 stamp-label 分類標籤,如「FULL-TIME 正職」 */
  stamp?: string;
}>();
</script>

<template>
  <nav
    class="mb-6 flex items-center justify-between"
    aria-label="返回上層"
    data-testid="page-back-bar"
  >
    <NuxtLink
      :to="to"
      class="text-fs-14 text-ink-soft transition-colors hover:text-shu"
      data-testid="page-back-bar-link"
    >← {{ label }}</NuxtLink>
    <span v-if="stamp" class="stamp-label" data-testid="page-back-bar-stamp">
      {{ stamp }}
    </span>
  </nav>
</template>
