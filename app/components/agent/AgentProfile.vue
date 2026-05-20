<script setup lang="ts">
// 探員詳情頁 profile band:AGENT FILE No.XXX 編號 + 雙重 ring 大頭照 + IG / 分類 chip
// + 近三個月日 / 夜 / 總三格統計 + 可選照片牆。
//
// 樣式策略:整體 layout / 字級 / 間距走 Tailwind utility;雙重 ring 大頭照沿用
// components.css 的 .agent-profile-photo class(box-shadow 多層,utility 無法表達)。
// 探員身分色一律走品牌朱,inline style 將 --agent-color 設為 var(--color-shu)。
import type { Agent } from '~~/shared/types';

const {
  agentInfo,
  fileNumber,
  stats,
} = defineProps<{
  agentInfo: Agent;
  /** AGENT FILE 編號(已 padStart,如「003」) */
  fileNumber: string;
  /** 近三個月統計;欄位為 null 代表 fetch 失敗 / pending,UI 以「—」呈現 */
  stats: {
    dayCount: number | null;
    nightCount: number | null;
    total: number | null;
  };
}>();

const instagramHandle = computed(() => {
  if (!agentInfo.instagram) return '';
  const segments = agentInfo.instagram.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? '';
});

const hasPhotos = computed(() => (agentInfo.photos ?? []).filter(Boolean).length > 0);

const padded = (value: number | null) =>
  value === null ? '—' : String(value).padStart(2, '0');
</script>

<template>
  <section
    class="relative mb-12 grid gap-8 overflow-hidden rounded-lg border border-rule bg-surface p-6 sm:grid-cols-[280px_1fr] sm:p-8"
    style="--agent-color: var(--color-shu)"
    data-testid="agent-profile"
  >
    <!-- 朱紅左側實線(取代探員代表色實線,身分色一律走品牌朱) -->
    <span
      class="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-shu"
      aria-hidden="true"
    />

    <span
      class="agent-profile-photo block w-full max-w-[240px] place-self-center sm:place-self-start"
    >
      <NuxtImg
        v-if="agentInfo.picture"
        :src="agentInfo.picture"
        :alt="`${agentInfo.name} 的照片`"
        class="h-full w-full object-cover"
        loading="lazy"
        data-testid="agent-profile-image"
      />
    </span>

    <div class="flex flex-col gap-4">
      <span class="stamp-label" data-testid="agent-profile-file-number">
        AGENT FILE · No. {{ fileNumber }}
      </span>
      <h1
        class="serif flex items-baseline gap-2 text-fs-48 leading-none text-shu sm:text-[56px]"
        data-testid="agent-profile-name"
      >
        <span>{{ agentInfo.name }}</span>
        <span
          v-if="agentInfo.emoji"
          class="text-fs-28"
          aria-hidden="true"
        >{{ agentInfo.emoji }}</span>
      </h1>

      <div class="flex flex-wrap gap-2" data-testid="agent-profile-chips">
        <span
          class="inline-flex items-center gap-2 rounded-pill border border-rule bg-paper px-3 py-1.5 text-fs-13 text-ink"
          data-testid="agent-profile-status"
        >
          <span class="stamp-label text-ink-mute">分類</span>
          <span class="serif">{{ agentInfo.isFullTime ? '正職探員' : '現役探員' }}</span>
        </span>
        <a
          v-if="agentInfo.instagram"
          :href="agentInfo.instagram"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-pill border border-rule bg-paper px-3 py-1.5 text-fs-13 text-ink transition-colors hover:border-ink"
          data-testid="agent-profile-instagram"
        >
          <UIcon name="i-mdi-instagram" class="h-3.5 w-3.5" />
          <span>Instagram</span>
          <span class="stamp-label text-ink-mute">@{{ instagramHandle }}</span>
        </a>
      </div>

      <div
        class="mt-2 grid grid-cols-3 gap-4 border-t border-rule pt-5"
        data-testid="agent-profile-stats"
      >
        <div class="flex flex-col gap-1">
          <span class="stamp-label">近 3 個月 · 早班</span>
          <span
            class="mono tnum text-fs-36 leading-none text-ink"
            data-testid="agent-profile-stat-day"
          >{{ padded(stats.dayCount) }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="stamp-label">近 3 個月 · 晚班</span>
          <span
            class="mono tnum text-fs-36 leading-none text-ink"
            data-testid="agent-profile-stat-night"
          >{{ padded(stats.nightCount) }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="stamp-label">總計</span>
          <span
            class="mono tnum text-fs-36 leading-none text-ink"
            data-testid="agent-profile-stat-total"
          >{{ padded(stats.total) }}</span>
        </div>
      </div>

      <div v-if="hasPhotos" class="mt-4" data-testid="agent-photo-section">
        <div class="mb-3 flex items-center gap-2">
          <span class="stamp-label">PHOTOS · 照片</span>
          <span class="h-px flex-1 bg-rule-2" aria-hidden="true" />
        </div>
        <AgentPhotoCarousel :photos="agentInfo.photos" :agent-name="agentInfo.name" />
      </div>
    </div>
  </section>
</template>
