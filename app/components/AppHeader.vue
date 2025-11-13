<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: '首頁',
    to: '/',
    icon: 'i-heroicons-home',
    active: route.path === '/',
  },
  {
    label: '完整班表',
    to: '/shifts',
    icon: 'i-heroicons-calendar',
    active: route.path === '/shifts',
  },
]);
</script>

<template>
  <UHeader
    :ui="{
      root: 'bg-linear-to-r from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 shadow-md border-b border-pink-200 dark:border-gray-700 h-20 sticky top-0 z-50',
      toggle: 'md:hidden',
    }"
    mode="slideover"
  >
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-2 md:gap-4 hover:opacity-80 transition-opacity">
        <div class="relative shrink-0">
          <NuxtImg
            src="https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcu68wNN6fJAvDsOl9UNkiP7qSKXjIuRWradT06"
            alt="喫茶 朱雫 Maid Café"
            class="w-12 h-12 md:w-16 md:h-16 object-cover rounded-full ring-2 md:ring-4 ring-pink-300 dark:ring-pink-600 shadow-lg"
            densities="x1"
          />
        </div>
        <div class="min-w-0">
          <h1
            class="text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent truncate"
          >
            喫茶 朱雫 Maid Café
          </h1>
          <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5 md:mt-1 truncate">
            探員排班查詢工具
          </p>
        </div>
      </NuxtLink>
    </template>

    <template #right>
      <UNavigationMenu class="hidden md:block" color="neutral" variant="link" :items="items" />
    </template>

    <template #body>
      <UNavigationMenu :items="items" color="neutral" orientation="vertical" />
    </template>
  </UHeader>
</template>
