<script setup lang="ts">
import { BOOKING_URL } from '~~/shared/constant';

const isVisible = ref(false);
const isAtPageBottom = ref(false);

const checkScroll = () => {
  const { scrollY, innerHeight } = window;
  const { scrollHeight } = document.documentElement;
  isVisible.value = scrollY > 300;
  isAtPageBottom.value = innerHeight + scrollY >= scrollHeight - 50;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const goToBooking = () => {
  window.open(BOOKING_URL, '_blank', 'noopener,noreferrer');
};

onMounted(() => {
  window.addEventListener('scroll', checkScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll);
});
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div v-if="isVisible" class="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
      <UButton
        v-if="!isAtPageBottom"
        color="primary"
        variant="solid"
        size="lg"
        icon="i-heroicons-calendar"
        class="rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200"
        @click="goToBooking"
      >
        <span class="hidden sm:inline">線上訂位</span>
      </UButton>

      <UButton
        color="neutral"
        variant="solid"
        size="lg"
        icon="i-heroicons-arrow-up"
        class="rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200"
        @click="scrollToTop"
      >
        <span class="hidden sm:inline">回到頂部</span>
      </UButton>
    </div>
  </Transition>
</template>
