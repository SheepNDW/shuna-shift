<script setup lang="ts">
interface Props {
  shiftType: 'day' | 'night';
  agents: { name: string; textColor: string }[];
  isEmpty?: boolean;
  highlightedAgents?: Set<string>;
}

const props = defineProps<Props>();

// 排序：高亮探員排在前面
const sortedAgents = computed(() => {
  if (!props.highlightedAgents || props.highlightedAgents.size === 0) {
    return props.agents;
  }

  return [...props.agents].sort((a, b) => {
    const aHighlighted = props.highlightedAgents!.has(a.name);
    const bHighlighted = props.highlightedAgents!.has(b.name);
    if (aHighlighted && !bHighlighted) return -1;
    if (!aHighlighted && bHighlighted) return 1;
    return 0;
  });
});
</script>

<template>
  <div class="mb-8">
    <!-- Shift Header -->
    <div class="flex items-center justify-center gap-3 mb-6">
      <div
        :class="[
          'h-px flex-1 bg-linear-to-r from-transparent',
          shiftType === 'day' ? 'to-yellow-300' : 'to-indigo-300',
        ]"
      />
      <div
        :class="[
          'flex items-center gap-2 px-6 py-3 rounded-full shadow-lg',
          shiftType === 'day'
            ? 'bg-linear-to-r from-yellow-400 to-orange-400'
            : 'bg-linear-to-r from-indigo-500 to-purple-500',
        ]"
      >
        <UIcon
          :name="shiftType === 'day' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
          class="w-5 h-5 text-white"
        />
        <h4 class="text-xl font-bold text-white">{{ shiftType === 'day' ? '早班' : '晚班' }}</h4>
        <UBadge color="neutral" variant="solid" size="lg">
          {{ agents.length }}
        </UBadge>
      </div>
      <div
        :class="[
          'h-px flex-1 bg-linear-to-l from-transparent',
          shiftType === 'day' ? 'to-yellow-300' : 'to-indigo-300',
        ]"
      />
    </div>

    <!-- Agents Grid -->
    <div
      v-if="!isEmpty && agents.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <AgentCard
        v-for="agent in sortedAgents"
        :key="agent.name"
        :name="agent.name"
        :text-color="agent.textColor"
        :is-highlighted="highlightedAgents?.has(agent.name)"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-8 px-4 bg-white rounded-2xl shadow-md"
    >
      <UIcon
        :name="shiftType === 'day' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
        class="w-12 h-12 text-gray-300 mb-3"
      />
      <p class="text-center text-gray-500 ">
        {{ shiftType === 'day' ? '早班' : '晚班' }}無排班
      </p>
    </div>
  </div>
</template>
