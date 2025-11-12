<script setup lang="ts">
import { BOOKING_URL } from '~~/shared/constant';

const currentYear = getCurrentYear();
const scheduleStore = useScheduleStore();

const lastUpdated = computed(() => {
  if (!scheduleStore.lastUpdated) {
    return '資料載入中...';
  }

  return formatDateTime(scheduleStore.lastUpdated);
});
</script>

<template>
  <footer
    class="mt-auto bg-linear-to-r from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 border-t border-pink-200 dark:border-gray-700"
  >
    <UContainer>
      <div class="py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div class="text-center md:text-left">
            <h3
              class="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-center md:justify-start gap-2"
            >
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-pink-500" />
              關於本站
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              喫茶朱雫探員排班查詢工具，方便前輩快速查看班表資訊。
            </p>
          </div>

          <!-- Data Source Section -->
          <div class="text-center">
            <h3
              class="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-center gap-2"
            >
              <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-purple-500" />
              資料來源
            </h3>
            <a
              href="https://docs.google.com/spreadsheets/d/1Fe39ZrJdp8LFIIg886VoqiAC6H5k8Td4fwZVp85sInw/"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-sm font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 border border-pink-200 dark:border-pink-800"
            >
              <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4" />
              朱雫班表 Google 表單
            </a>
            <p
              class="text-xs text-gray-500 dark:text-gray-500 mt-3 flex items-center justify-center gap-1"
            >
              <UIcon name="i-heroicons-clock" class="w-3 h-3" />
              最後同步：{{ lastUpdated }}
            </p>
          </div>

          <!-- Quick Links Section -->
          <div class="text-center md:text-right">
            <h3
              class="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-center md:justify-end gap-2"
            >
              <UIcon name="i-heroicons-link" class="w-5 h-5 text-indigo-500" />
              快速連結
            </h3>
            <div class="flex flex-col gap-2 items-center md:items-end">
              <NuxtLink
                to="/"
                class="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors flex items-center gap-1"
              >
                <UIcon name="i-heroicons-home" class="w-4 h-4" />
                今日班表
              </NuxtLink>
              <NuxtLink
                to="/shifts"
                class="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors flex items-center gap-1"
              >
                <UIcon name="i-heroicons-calendar-days" class="w-4 h-4" />
                完整班表
              </NuxtLink>
              <a
                :href="BOOKING_URL"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors flex items-center gap-1"
              >
                <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                線上訂位
              </a>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200 dark:border-gray-700 mb-6" />

        <!-- Bottom Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500 dark:text-gray-500">
          <p class="flex items-center justify-center md:justify-start gap-1">
            <UIcon name="i-heroicons-heart-solid" class="w-4 h-4 text-pink-500" />
            Made with love for 喫茶 朱雫 Maid Café
          </p>
          <p class="text-center">© {{ currentYear }} 僅供個人練習使用，無商業用途</p>
          <div class="flex items-center justify-center md:justify-end gap-2">
            <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-green-500" />
            <span>資料定時更新</span>
          </div>
        </div>
      </div>
    </UContainer>
  </footer>
</template>
