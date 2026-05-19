<script setup lang="ts">
// 首頁今日班表的單一班別欄（早班或晚班）。
// 取代 index.vue 內手刻的 Day / Night Shift Section。
const { type, agents } = defineProps<{
  type: 'day' | 'night';
  agents: { name: string; textColor: string }[];
}>();

const meta = computed(() =>
  type === 'day'
    ? { name: '早班', sub: 'DAY · 13:30–17:30' }
    : { name: '晚班', sub: 'NIGHT · 15:00–21:30' }
);

const count = computed(() => agents.length);
const countLabel = computed(() => padZero(count.value));
const isEmpty = computed(() => count.value === 0);
</script>

<template>
  <section class="relative overflow-hidden rounded-lg border border-rule bg-surface p-6">
    <!-- 班別朱條 -->
    <span
      class="absolute inset-y-0 left-0 w-[3px]"
      :class="type === 'day' ? 'bg-day' : 'bg-night'"
      aria-hidden="true"
    />

    <header
      class="mb-5 flex items-center gap-3"
      :class="type === 'day' ? 'text-day-deep' : 'text-night-deep'"
    >
      <span
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-current p-2"
      >
        <ShiftGlyph :type="type" />
      </span>
      <div class="flex flex-col">
        <div class="flex items-baseline gap-2">
          <span class="serif text-fs-22" data-testid="shift-name">{{ meta.name }}</span>
          <span class="mono tnum text-fs-22 text-ink-soft" data-testid="shift-count">
            {{ countLabel }}
          </span>
        </div>
        <span class="stamp-label">{{ meta.sub }}</span>
      </div>
    </header>

    <div
      v-if="isEmpty"
      class="flex flex-col items-center gap-2 px-6 py-10 text-center text-ink-mute"
      data-testid="shift-empty"
    >
      <span class="serif text-fs-28 text-rule" aria-hidden="true">休</span>
      <span class="stamp-label">無排班</span>
    </div>
    <div
      v-else
      class="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(108px,1fr))]"
    >
      <AgentPortrait
        v-for="agent in agents"
        :key="agent.name"
        :name="agent.name"
        :text-color="agent.textColor"
      />
    </div>
  </section>
</template>
