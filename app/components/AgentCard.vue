<script setup lang="ts">
// 探員卡：給定 agent 渲染 /agents 圖鑑列表的卡片
// （4:3 照片 + 名字 + emoji 章 + FULL 章 + IG handle）。
//
// 註：探員身分色設計上一律走品牌朱（var(--color-shu)）。班表中的 textColor 承載
// 「晚班時段 / 代班」語意，與身分無關；AGENTS Map 也沒有 color 欄位，故卡片
// border / 名字色 / 章色都直接用朱色 utility。
import type { Agent } from '~~/shared/types';

const { agent } = defineProps<{
  /** 探員資料（來自 AGENTS Map） */
  agent: Agent;
}>();

const instagramHandle = computed(() => {
  if (!agent.instagram) return '';
  const segments = agent.instagram.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? '';
});

const { hasFailed, onImageError } = useImageFallback();
</script>

<template>
  <NuxtLink
    :to="`/agents/${agent.id}`"
    class="agent-card group block overflow-hidden rounded-lg border border-rule bg-surface transition-[transform,border-color] duration-200 motion-safe:hover:-translate-y-1 hover:border-shu focus-visible:border-shu"
    data-testid="agent-card"
  >
    <div class="flex flex-col">
      <div class="relative aspect-[4/3] bg-paper-2">
        <NuxtImg
          v-if="agent.picture && !hasFailed(agent.picture)"
          :src="agent.picture"
          :alt="`${agent.name} 的照片`"
          width="360"
          height="270"
          :class="[
            'h-full w-full object-cover transition duration-300',
            agent.isGraduated
              && 'grayscale-[60%] opacity-90 motion-safe:group-hover:grayscale-0 motion-safe:group-hover:opacity-100',
          ]"
          loading="lazy"
          data-testid="agent-card-image"
          @error="onImageError(agent.picture)"
        />
        <span
          v-else
          class="serif flex h-full w-full items-center justify-center text-fs-48 text-ink-mute"
          aria-hidden="true"
          data-testid="agent-card-image-fallback"
        >{{ agent.name.charAt(0) }}</span>
        <span
          v-if="agent.emoji"
          class="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-rule bg-paper text-fs-16"
          aria-hidden="true"
          data-testid="agent-card-emoji"
        >{{ agent.emoji }}</span>
      </div>
      <div class="flex flex-col gap-2 p-5">
        <div class="flex items-center gap-2">
          <span
            :class="[
              'serif text-fs-22',
              agent.isGraduated ? 'text-ink-soft' : 'text-shu',
            ]"
            data-testid="agent-card-name"
          >
            {{ agent.name }}
          </span>
          <span
            v-if="agent.isGraduated"
            class="inline-flex items-center rounded-sm border border-ink-mute px-1.5 py-px text-[10px] tracking-stamp text-ink-mute"
            data-testid="agent-card-graduated"
          >卒業</span>
          <span
            v-else-if="agent.isFullTime"
            class="inline-flex items-center rounded-sm border border-shu px-1.5 py-px text-[10px] tracking-stamp text-shu"
            data-testid="agent-card-fulltime"
          >FULL</span>
        </div>
        <div class="mt-1 flex items-center justify-between border-t border-rule-2 pt-3">
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
  </NuxtLink>
</template>
