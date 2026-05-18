<script setup lang="ts">
// 朱字章 — 雙框印章樣式的品牌標記，樣式見 components.css 的 .shu-stamp
// 視為裝飾元素（aria-hidden）：使用處皆有相鄰的「朱雫」品牌文字表達語意
const { size = 44 } = defineProps<{
  /** 印章邊長（px）；字級為邊長的一半 */
  size?: number;
}>();
</script>

<template>
  <span
    class="shu-stamp"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${size * 0.5}px`,
    }"
    aria-hidden="true"
  >朱</span>
</template>
