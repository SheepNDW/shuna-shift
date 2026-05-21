<script setup lang="ts">
// 回到頁首的浮動小圓鈕:捲動超過閾值才淡入。朱紅實心、無漸層、無重陰影。
const SCROLL_THRESHOLD = 300;

const isVisible = ref(false);

function checkScroll(): void {
  isVisible.value = window.scrollY > SCROLL_THRESHOLD;
}

function scrollToTop(): void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
}

onMounted(() => {
  checkScroll();
  window.addEventListener('scroll', checkScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll);
});
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <button
      v-if="isVisible"
      type="button"
      class="fixed bottom-8 right-8 z-50 flex size-11 items-center justify-center rounded-full bg-shu text-white shadow-paper-2 transition-colors duration-150 hover:bg-shu-deep"
      aria-label="回到頂部"
      data-testid="back-to-top"
      @click="scrollToTop"
    >
      <UIcon name="i-heroicons-arrow-up" class="size-5" aria-hidden="true" />
    </button>
  </Transition>
</template>
