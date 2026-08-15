<script setup lang="ts">
// 浮動操作鈕:回到頁首 + 行動版訂位入口。捲動超過閾值才整組淡入。
// 桌機 header 已常駐「預約」CTA,故訂位鈕僅在 ≤920px(header CTA 隱藏處)顯示,
// 避免行動版非首頁失去訂位入口。
import { BOOKING_URL } from '~~/shared/constant';

const SCROLL_THRESHOLD = 300;

// 捲動位置與 reduced-motion 都交給 VueUse:兩者都是 SSR-safe（server 端分別為
// 0 與 'no-preference'，與首屏「不顯示」一致），監聽器隨 effect scope 自動解除，
// 不必自己配對 onMounted / onUnmounted。
const { y } = useWindowScroll();
const prefersReducedMotion = usePreferredReducedMotion();

// 唯一的來源狀態是 y,顯示與否用推導的,不另存一份 ref。
const isVisible = computed(() => y.value > SCROLL_THRESHOLD);

function scrollToTop(): void {
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion.value === 'reduce' ? 'auto' : 'smooth',
  });
}
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
    <div
      v-if="isVisible"
      class="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3"
    >
      <!-- 訂位入口:桌機 header 已有常駐「預約」CTA,故僅在 ≤920px 顯示 -->
      <a
        :href="BOOKING_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="hidden h-11 items-center gap-2 rounded-full bg-shu px-4 text-fs-14 text-white shadow-paper-2 transition-colors duration-150 hover:bg-shu-deep max-[920px]:inline-flex"
        data-testid="back-to-top-booking"
      >
        <UIcon name="i-heroicons-calendar-days" class="size-5 shrink-0" aria-hidden="true" />
        <span>線上訂位</span>
      </a>

      <button
        type="button"
        class="flex size-11 items-center justify-center rounded-full bg-shu text-white shadow-paper-2 transition-colors duration-150 hover:bg-shu-deep"
        aria-label="回到頂部"
        data-testid="back-to-top"
        @click="scrollToTop"
      >
        <UIcon name="i-heroicons-arrow-up" class="size-5" aria-hidden="true" />
      </button>
    </div>
  </Transition>
</template>
