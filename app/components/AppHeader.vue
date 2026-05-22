<script setup lang="ts">
import { BOOKING_URL } from '~~/shared/constant';

const route = useRoute();

// aria：窄螢幕會隱藏 romaji 標籤，連結可及名稱不應塌縮成單一漢字，
// 故各連結明確指定完整名稱
const navItems = [
  { to: '/', label: '今日', kanji: '今', aria: '今日班表' },
  { to: '/shifts', label: '班表', kanji: '表', aria: '完整班表' },
  { to: '/agents', label: '探員', kanji: '員', aria: '探員圖鑑' },
  { to: '/statistics', label: '統計', kanji: '計', aria: '出勤統計' },
] as const;

function isActive(to: string): boolean {
  return isNavLinkActive(route.path, to);
}
</script>

<template>
  <header
    class="sticky top-0 z-50 flex items-center gap-8 border-b border-rule bg-paper/90 px-7 py-3.5 backdrop-blur-[8px] max-[920px]:gap-4 max-[920px]:px-4 max-[920px]:py-2.5"
  >
    <NuxtLink
      to="/"
      class="flex items-center gap-3 transition-opacity duration-150 hover:opacity-80"
    >
      <BrandMark :size="36" />
      <span class="flex flex-col leading-[1.05]">
        <span class="serif text-fs-22 tracking-[0.02em] text-ink">朱雫</span>
        <span class="stamp-label max-xs:hidden">SHUNA · MAID CAFÉ</span>
      </span>
    </NuxtLink>

    <nav class="ml-auto flex gap-1" aria-label="主導覽">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'flex items-center gap-2 rounded-md border px-3.5 py-2 text-fs-14 transition-colors duration-150 max-[920px]:px-2.5',
          isActive(item.to)
            ? 'border-shu-line bg-shu-soft text-shu'
            : 'border-transparent text-ink-soft hover:bg-paper-2 hover:text-ink',
        ]"
        :aria-current="isActive(item.to) ? 'page' : undefined"
        :aria-label="item.aria"
      >
        <span
          class="serif text-[17px] transition-opacity duration-150 max-[920px]:text-[16px]"
          :class="isActive(item.to) ? 'opacity-100' : 'opacity-[0.55]'"
        >{{ item.kanji }}</span>
        <span class="max-[920px]:hidden">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <a
      class="inline-flex items-center gap-2.5 rounded-md border border-ink bg-ink px-4 py-[9px] text-fs-14 text-paper transition-colors duration-150 hover:border-shu hover:bg-shu max-[920px]:hidden"
      :href="BOOKING_URL"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>預約</span>
      <span class="font-mono text-fs-12 uppercase tracking-stamp text-paper/70">RESERVE</span>
    </a>
  </header>
</template>
