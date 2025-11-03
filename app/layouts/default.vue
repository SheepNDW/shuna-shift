<script setup lang="ts"></script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <main class="flex-1">
      <div
        class="min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      >
        <slot />
      </div>
    </main>

    <AppFooter />
  </div>
</template>
