<script setup lang="ts">
// 探員圖鑑分組區塊:漢字圖章 + romaji 標籤 + serif desc + 髮絲線延伸 + mono 計數 + 卡片格子。
// 取代 /agents 頁兩段不同色漸層 pill section,正職 / 現役共用同一視覺語言。
import type { Agent } from '~~/shared/types';

defineProps<{
  /** 漢字圖章(單字),如「正」「現」 */
  kanji: string;
  /** romaji 分類小標,如「FULL-TIME · 正職探員」 */
  label: string;
  /** serif 區段副標,如「店內招牌．長期駐店」 */
  desc: string;
  /** 探員列表 */
  agents: Agent[];
}>();
</script>

<template>
  <section class="mb-16">
    <header class="mb-8 flex items-center gap-4">
      <span class="kanji-mark serif" aria-hidden="true">{{ kanji }}</span>
      <div class="flex flex-col">
        <span class="stamp-label" data-testid="agent-section-label">{{ label }}</span>
        <span class="serif text-fs-22 text-ink" data-testid="agent-section-desc">
          {{ desc }}
        </span>
      </div>
      <span class="h-px flex-1 bg-rule" aria-hidden="true" />
      <span
        class="mono tnum text-fs-22 text-ink-soft"
        data-testid="agent-section-count"
      >{{ String(agents.length).padStart(2, '0') }}</span>
    </header>

    <EmptyState
      v-if="agents.length === 0"
      kanji="無"
      title="尚無探員"
      subtitle="這個分類目前沒有探員。"
      data-testid="agent-section-empty"
    />
    <div
      v-else
      class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      data-testid="agent-section-grid"
    >
      <AgentCard v-for="agent in agents" :key="agent.id" :agent="agent" />
    </div>
  </section>
</template>
