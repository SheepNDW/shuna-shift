<script setup lang="ts">
// 區段分隔:左右髮絲線 + 選填中心 ornament(漢字圖章 + stamp-label)。
// kanji / label 皆選填;兩者都不給時退化為單純一條置中髮絲線。
defineProps<{
  /** 中心漢字 ornament,如「色」「員」 */
  kanji?: string;
  /** 中心 stamp-label 文字 */
  label?: string;
}>();
</script>

<template>
  <div class="my-8 flex items-center gap-4" data-testid="section-rule">
    <span class="h-px flex-1 bg-rule" aria-hidden="true" />
    <span
      v-if="kanji || label"
      class="flex items-center gap-2 text-ink-soft"
    >
      <span
        v-if="kanji"
        class="serif text-fs-18 text-shu"
        data-testid="section-rule-kanji"
      >{{ kanji }}</span>
      <span
        v-if="label"
        class="stamp-label"
        data-testid="section-rule-label"
      >{{ label }}</span>
    </span>
    <span class="h-px flex-1 bg-rule" aria-hidden="true" />
  </div>
</template>
