<script setup lang="ts">
// 探員卡:給定 agent: Agent 渲染卡片。三種 variant:
//   - portrait (default):/agents 列表用,4:3 照片 + 名字 + 章 + bio + IG handle
//   - compact:緊湊圓頭像 + 名字 + IG icon,給側欄 / 預覽情境使用
//   - full:大卡(profile band 風格),AGENT FILE No.XXX 編號 + 大頭照 + bio
// 取代舊版 AgentCard + AgentListCard 雙生件,避免硬刻多個元件。
//
// 註:探員身分色設計上一律走品牌朱(var(--color-shu))。班表中的 textColor 承載
// 「晚班時段 / 代班」語意,與身分無關;AGENTS Map 也沒有 color 欄位,故卡片
// border / 名字色 / 章色都直接用朱色 utility,不再帶 --agent-color 變數。
import type { Agent } from '~~/shared/types';

const {
  agent,
  variant = 'portrait',
  fileNumber = '',
} = defineProps<{
  /** 探員資料(來自 AGENTS Map) */
  agent: Agent;
  /** 顯示形態 */
  variant?: 'compact' | 'portrait' | 'full';
  /** AGENT FILE 編號(僅 full variant 使用,例如「No. 003」) */
  fileNumber?: string;
}>();

const instagramHandle = computed(() => {
  if (!agent.instagram) return '';
  const segments = agent.instagram.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? '';
});
</script>

<template>
  <NuxtLink
    :to="`/agents/${agent.id}`"
    class="agent-card group block overflow-hidden rounded-lg border border-rule bg-surface transition-[transform,border-color] duration-200 motion-safe:hover:-translate-y-1 hover:border-shu focus-visible:border-shu"
    :data-variant="variant"
    data-testid="agent-card"
  >
    <!-- compact:圓頭像 + 名字 + 可選 FULL 章 -->
    <div
      v-if="variant === 'compact'"
      class="flex items-center gap-3 p-3"
    >
      <span
        class="relative inline-flex h-12 w-12 shrink-0 overflow-hidden rounded-full border border-rule bg-paper-2"
      >
        <NuxtImg
          v-if="agent.picture"
          :src="agent.picture"
          :alt="`${agent.name} 的照片`"
          class="h-full w-full object-cover"
          loading="lazy"
          data-testid="agent-card-image"
        />
      </span>
      <span class="flex min-w-0 flex-col">
        <span class="flex items-center gap-1.5">
          <span class="serif truncate text-fs-16 text-ink" data-testid="agent-card-name">
            {{ agent.name }}
          </span>
          <span v-if="agent.emoji" aria-hidden="true">{{ agent.emoji }}</span>
        </span>
        <span
          v-if="agent.isFullTime"
          class="mt-0.5 inline-flex w-fit items-center rounded-sm border border-shu px-1.5 py-px text-[10px] tracking-stamp text-shu"
          data-testid="agent-card-fulltime"
        >FULL</span>
      </span>
    </div>

    <!-- portrait:agents 圖鑑列表預設樣式 -->
    <div v-else-if="variant === 'portrait'" class="flex flex-col">
      <div class="relative aspect-[4/3] bg-paper-2">
        <NuxtImg
          v-if="agent.picture"
          :src="agent.picture"
          :alt="`${agent.name} 的照片`"
          class="h-full w-full object-cover"
          loading="lazy"
          data-testid="agent-card-image"
        />
        <span
          v-if="agent.emoji"
          class="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-rule bg-paper text-fs-16"
          aria-hidden="true"
          data-testid="agent-card-emoji"
        >{{ agent.emoji }}</span>
      </div>
      <div class="flex flex-col gap-2 p-5">
        <div class="flex items-center gap-2">
          <span class="serif text-fs-22 text-shu" data-testid="agent-card-name">
            {{ agent.name }}
          </span>
          <span
            v-if="agent.isFullTime"
            class="inline-flex items-center rounded-sm border border-shu px-1.5 py-px text-[10px] tracking-stamp text-shu"
            data-testid="agent-card-fulltime"
          >FULL</span>
        </div>
        <div
          class="mt-1 flex items-center justify-between border-t border-rule-2 pt-3"
        >
          <span
            v-if="instagramHandle"
            class="stamp-label truncate"
            data-testid="agent-card-handle"
          >@{{ instagramHandle }}</span>
          <span v-else class="stamp-label text-ink-mute">—</span>
          <span
            class="text-ink-mute transition-colors group-hover:text-shu"
            aria-hidden="true"
          >→</span>
        </div>
      </div>
    </div>

    <!-- full:profile band 風格大型卡片(未供 detail 頁直接使用,留給 search 結果等情境) -->
    <div
      v-else
      class="grid items-center gap-6 p-6 sm:grid-cols-[200px_1fr] sm:gap-8 sm:p-8"
    >
      <span
        class="agent-profile-photo block w-full max-w-[200px]"
        style="--agent-color: var(--color-shu)"
      >
        <NuxtImg
          v-if="agent.picture"
          :src="agent.picture"
          :alt="`${agent.name} 的照片`"
          class="h-full w-full object-cover"
          loading="lazy"
          data-testid="agent-card-image"
        />
      </span>
      <div class="flex flex-col gap-3">
        <span
          v-if="fileNumber"
          class="stamp-label"
          data-testid="agent-card-file-number"
        >AGENT FILE · {{ fileNumber }}</span>
        <span class="flex items-baseline gap-2">
          <span class="serif text-fs-36 text-shu" data-testid="agent-card-name">
            {{ agent.name }}
          </span>
          <span v-if="agent.emoji" class="text-fs-22" aria-hidden="true">
            {{ agent.emoji }}
          </span>
        </span>
        <span
          v-if="agent.isFullTime"
          class="stamp-label inline-flex w-fit items-center rounded-sm border border-shu px-2 py-0.5 text-shu"
          data-testid="agent-card-fulltime"
        >FULL-TIME</span>
        <span
          v-if="instagramHandle"
          class="stamp-label"
          data-testid="agent-card-handle"
        >@{{ instagramHandle }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
