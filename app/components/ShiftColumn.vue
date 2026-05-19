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
const countLabel = computed(() => String(count.value).padStart(2, '0'));
const isEmpty = computed(() => count.value === 0);
</script>

<template>
  <section class="shift-col" :class="`shift-col--${type}`">
    <header class="shift-col__head">
      <span class="shift-col__icon">
        <ShiftGlyph :type="type" />
      </span>
      <span class="serif shift-col__name">{{ meta.name }}</span>
      <span class="mono tnum shift-col__count">{{ countLabel }}</span>
      <span class="stamp-label shift-col__sub">{{ meta.sub }}</span>
    </header>

    <div v-if="isEmpty" class="shift-col__empty">
      <span class="serif shift-col__empty-kanji" aria-hidden="true">休</span>
      <span class="stamp-label">無排班</span>
    </div>
    <div v-else class="shift-col__grid">
      <AgentPortrait
        v-for="agent in agents"
        :key="agent.name"
        :name="agent.name"
        :text-color="agent.textColor"
      />
    </div>
  </section>
</template>

<style scoped>
.shift-col {
  position: relative;
  overflow: hidden;
  padding: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
}
.shift-col::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}
.shift-col--day::before {
  background: var(--color-day);
}
.shift-col--night::before {
  background: var(--color-night);
}

.shift-col__head {
  display: grid;
  grid-template-columns: auto auto 1fr;
  grid-template-rows: auto auto;
  align-items: center;
  gap: 4px 12px;
  margin-bottom: 20px;
}
.shift-col--day .shift-col__head {
  color: var(--color-day-deep);
}
.shift-col--night .shift-col__head {
  color: var(--color-night-deep);
}

.shift-col__icon {
  grid-row: 1 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 8px;
  border: 1px solid currentColor;
  border-radius: 50%;
}
.shift-col__name {
  font-size: 22px;
}
.shift-col__count {
  font-size: 22px;
  color: var(--color-ink-soft);
}
.shift-col__sub {
  grid-column: 2 / 4;
}

.shift-col__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
  gap: 20px;
}

.shift-col__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 24px;
  text-align: center;
  color: var(--color-ink-mute);
}
.shift-col__empty-kanji {
  font-size: 32px;
  color: var(--color-rule);
}
</style>
