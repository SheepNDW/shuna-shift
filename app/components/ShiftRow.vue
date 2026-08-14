<script setup lang="ts">
// 班表單日中的單一班別列：班別標記（圖示 + 名稱 + 人數）+ 探員 chip 並列。
import { isSelectedAgentCell } from '~~/shared/utils/agent-name';

const {
  type,
  agents,
  highlightedAgents = undefined,
} = defineProps<{
  type: 'day' | 'night';
  agents: { name: string; textColor: string }[];
  /** 篩選高亮的探員名稱集合；高亮者排序提前 */
  highlightedAgents?: Set<string>;
}>();

const shiftName = computed(() => (type === 'day' ? '早班' : '晚班'));
const countLabel = computed(() => padZero(agents.length));
const isEmpty = computed(() => agents.length === 0);

// 高亮探員排序提前，便於篩選時快速辨識（不變更原陣列）。
// 高亮判定要剝括號並正規化名稱，遠比 `Set.has` 貴，故每人只算一次後隨陣列帶著走，
// 不在 comparator 與 template 裡重算。
const displayAgents = computed(() => {
  const set = highlightedAgents;
  if (!set || set.size === 0) {
    return agents.map((agent) => ({ ...agent, highlighted: false }));
  }

  return agents
    .map((agent) => ({ ...agent, highlighted: isSelectedAgentCell(agent.name, set) }))
    .sort((a, b) => Number(b.highlighted) - Number(a.highlighted));
});
</script>

<template>
  <div
    class="grid grid-cols-[160px_1fr] items-start gap-5 max-[920px]:grid-cols-1 max-[920px]:gap-2"
    data-testid="shift-row"
    :data-type="type"
  >
    <div
      class="flex items-center gap-2.5 pt-1"
      :class="type === 'day' ? 'text-day-deep' : 'text-night-deep'"
    >
      <span
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border p-1.5"
        :class="type === 'day' ? 'border-day bg-day-soft' : 'border-night bg-night-soft'"
      >
        <ShiftGlyph :type="type" />
      </span>
      <span class="serif text-fs-18" data-testid="shift-row-name">{{ shiftName }}</span>
      <span
        class="mono tnum text-fs-14 text-ink-mute"
        :aria-label="`共 ${agents.length} 人`"
        data-testid="shift-row-count"
      >
        {{ countLabel }}
      </span>
    </div>

    <div class="flex flex-wrap gap-1.5 pt-1">
      <span
        v-if="isEmpty"
        class="stamp-label py-1"
        data-testid="shift-row-empty"
      >無排班</span>
      <template v-else>
        <AgentChip
          v-for="agent in displayAgents"
          :key="agent.name"
          :name="agent.name"
          :text-color="agent.textColor"
          :highlighted="agent.highlighted"
        />
      </template>
    </div>
  </div>
</template>
