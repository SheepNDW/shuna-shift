<script setup lang="ts">
// 完整班表的篩選列：探員 chip 多選篩選 + 日期快速跳轉。
// 取代舊版 ScheduleFilter（下拉選單）與 DateJumper（backdrop-blur 玻璃卡片）。
//
// 註：班表原始資料並無「探員代表色」欄位（textColor 僅承載晚班時段 / 代班語意），
// 故篩選 chip 的 active 狀態統一採品牌朱色——透過 section 上的 --agent-color
// 變數注入，由 components.css 的 .filter-chip 取用。
import { AGENT_FILTER_PRIORITY, AGENTS } from '~~/shared/constant';

const selected = defineModel<string[]>({ required: true });

const { dates } = defineProps<{
  /** 可跳轉的日期標籤清單（格式：10月12日），依時間排序 */
  dates: string[];
}>();

const emit = defineEmits<{
  jump: [datetime: string];
}>();

// 探員排序：正職優先，其次依 AGENT_FILTER_PRIORITY 的偏好順位，其餘維持原序
const agentRoster = computed(() =>
  [...AGENTS]
    .map(([name, info]) => ({ name, isFullTime: info.isFullTime ?? false }))
    .sort((a, b) => {
      if (a.isFullTime !== b.isFullTime) return a.isFullTime ? -1 : 1;

      const aIndex = AGENT_FILTER_PRIORITY.indexOf(a.name);
      const bIndex = AGENT_FILTER_PRIORITY.indexOf(b.name);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    })
);

function isSelected(name: string): boolean {
  return selected.value.includes(name);
}

// 不可變更新：toggle 一律回傳新陣列
function toggle(name: string): void {
  selected.value = isSelected(name)
    ? selected.value.filter((n) => n !== name)
    : [...selected.value, name];
}

function clear(): void {
  selected.value = [];
}

const jumpDates = computed(() =>
  dates.map((datetime) => ({
    datetime,
    weekday: getWeekdayLabel(datetime),
    isToday: isToday(datetime),
  }))
);
</script>

<template>
  <section
    class="mb-8 rounded-lg border border-rule bg-surface p-5"
    style="--agent-color: var(--color-shu)"
    data-testid="filter-bar"
  >
    <div class="mb-3 flex items-center justify-between">
      <span class="stamp-label">FILTER · 篩選探員</span>
      <button
        v-if="selected.length > 0"
        type="button"
        class="stamp-label rounded-pill border border-rule px-2.5 py-1 text-ink-soft transition-colors hover:border-ink hover:text-ink"
        data-testid="filter-clear"
        @click="clear"
      >
        清除 ({{ selected.length }}) ✕
      </button>
    </div>

    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="agent in agentRoster"
        :key="agent.name"
        type="button"
        class="filter-chip"
        :class="{ 'is-active': isSelected(agent.name) }"
        :aria-pressed="isSelected(agent.name)"
        data-testid="filter-chip"
        @click="toggle(agent.name)"
      >
        <span class="filter-chip__dot" aria-hidden="true" />
        <span>{{ agent.name }}</span>
      </button>
    </div>

    <div
      v-if="jumpDates.length > 0"
      class="mt-5 flex flex-col gap-2.5 border-t border-rule-2 pt-4 sm:flex-row sm:items-start"
      data-testid="filter-jump"
    >
      <span class="stamp-label shrink-0 whitespace-nowrap sm:pt-1.5">
        JUMP TO · 跳轉
      </span>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="d in jumpDates"
          :key="d.datetime"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-fs-13 transition-colors"
          :class="
            d.isToday
              ? 'border-ink bg-ink text-paper'
              : 'border-rule bg-paper text-ink-soft hover:border-ink hover:text-ink'
          "
          data-testid="jump-pill"
          @click="emit('jump', d.datetime)"
        >
          <span class="mono tnum">{{ d.datetime }}</span>
          <span
            class="text-fs-12"
            :class="d.isToday ? 'text-paper/70' : 'text-ink-mute'"
          >{{ d.weekday }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
