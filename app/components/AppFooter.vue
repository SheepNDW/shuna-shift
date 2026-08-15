<script setup lang="ts">
import { BOOKING_URL, SCHEDULE_SHEET_URL } from '~~/shared/constant';

const currentYear = getCurrentYear();
const { lastUpdated, hasError } = await useSchedules();

// 失敗要與「還在載」分開：這個 render 之後不會再重試，一直顯示「同步中…」
// 等於把硬失敗說成進行中。
const lastUpdatedLabel = computed(() => {
  if (hasError.value) return '同步失敗';
  return lastUpdated.value ? formatDateTime(lastUpdated.value) : '同步中…';
});

// 重複的 utility 串集中為 const，維持 utility-first 又不逐處重貼
const colHeading = 'mb-1.5 font-mono text-fs-12 uppercase tracking-stamp text-ink';
const footerLink =
  'w-fit text-fs-14 text-ink-soft transition-colors duration-150 hover:text-shu';
</script>

<template>
  <footer class="relative z-10 mt-16 border-t border-rule bg-paper-2 pt-12 pb-6">
    <UContainer>
      <div
        class="mb-10 grid grid-cols-[1.2fr_2fr] gap-12 border-b border-rule pb-8 max-[920px]:grid-cols-1 max-[920px]:gap-6"
      >
        <div class="flex items-center gap-3">
          <BrandMark :size="32" />
          <div>
            <div class="serif text-fs-22 text-ink">喫茶 朱雫</div>
            <div class="stamp-label">SHUNA · MAID CAFÉ</div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-8 max-[920px]:grid-cols-2">
          <div class="flex flex-col gap-2">
            <div :class="colHeading">頁面</div>
            <NuxtLink :class="footerLink" to="/">今日班表</NuxtLink>
            <NuxtLink :class="footerLink" to="/shifts">完整班表</NuxtLink>
            <NuxtLink :class="footerLink" to="/agents">探員圖鑑</NuxtLink>
            <NuxtLink :class="footerLink" to="/statistics">出勤統計</NuxtLink>
          </div>

          <div class="flex flex-col gap-2">
            <div :class="colHeading">營業</div>
            <!-- 綠色中班（15:00–19:30）為少數，footer 顯示一般晚班的常見時段 -->
            <p class="m-0 text-fs-13 text-ink-soft">早班 13:30 – 17:30</p>
            <p class="m-0 text-fs-13 text-ink-soft">晚班 17:30 – 21:30</p>
            <p class="mono m-0 text-fs-13 text-ink-soft">店休 · 不定休</p>
          </div>

          <div class="flex flex-col gap-2">
            <div :class="colHeading">資料</div>
            <a
              :class="footerLink"
              :href="SCHEDULE_SHEET_URL"
              target="_blank"
              rel="noopener noreferrer"
            >朱雫班表 Google 表單</a>
            <a
              :class="footerLink"
              :href="BOOKING_URL"
              target="_blank"
              rel="noopener noreferrer"
            >線上訂位</a>
            <p class="mono m-0 text-fs-13 text-ink-soft">UPDATED · {{ lastUpdatedLabel }}</p>
          </div>
        </div>
      </div>

      <div
        class="flex items-center justify-between gap-4 max-xs:flex-col max-xs:items-start max-xs:gap-2"
      >
        <span class="stamp-label">© {{ currentYear }} 朱雫查班工具 · 非官方</span>
        <span class="stamp-label mono">v2.0 — paper edition</span>
      </div>
    </UContainer>
  </footer>
</template>
