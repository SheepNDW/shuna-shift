<script setup lang="ts"></script>

<template>
  <header
    class="sticky top-0 z-50 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 shadow-md border-b border-pink-200 dark:border-gray-700"
  >
    <UContainer>
      <div class="flex items-center justify-between h-20 py-4">
        <NuxtLink to="/" class="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <div class="relative">
            <NuxtImg
              src="https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcu68wNN6fJAvDsOl9UNkiP7qSKXjIuRWradT06"
              alt="喫茶 朱雫 Maid Café"
              class="object-cover rounded-full ring-4 ring-pink-300 dark:ring-pink-600 shadow-lg"
              densities="x1"
              width="64"
              height="64"
            />
          </div>
          <div>
            <h1
              class="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"
            >
              喫茶 朱雫 Maid Café
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">探員排班查詢工具</p>
          </div>
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-4">
          <UButton to="/" variant="ghost" color="neutral" size="lg">
            <UIcon name="i-heroicons-home" class="w-5 h-5 mr-2" />
            首頁
          </UButton>
          <UButton to="/shifts" variant="ghost" color="neutral" size="lg">
            <UIcon name="i-heroicons-calendar" class="w-5 h-5 mr-2" />
            完整班表
          </UButton>
        </nav>
      </div>
    </UContainer>
  </header>
</template>
