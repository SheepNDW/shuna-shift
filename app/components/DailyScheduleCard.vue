<script setup lang="ts">
const { schedule, highlightedAgents = undefined } = defineProps<{
  schedule: ShiftSchedule;
  highlightedAgents?: Set<string>;
}>();

const hasDayHighlighted = computed(() => {
  if (!highlightedAgents || highlightedAgents.size === 0) return true;
  return schedule.day.some((agent) => highlightedAgents!.has(agent.name));
});

const hasNightHighlighted = computed(() => {
  if (!highlightedAgents || highlightedAgents.size === 0) return true;
  return schedule.night.some((agent) => highlightedAgents!.has(agent.name));
});
</script>

<template>
  <div class="mb-10">
    <!-- Date Header -->
    <div class="text-center mb-8">
      <div
        class="inline-block px-6 py-3 rounded-2xl text-2xl font-bold shadow-lg border-4 border-white dark:border-gray-700 transform hover:scale-105 transition-transform"
        :style="{
          backgroundColor: schedule.date.backgroundColor || '#f3f4f6',
        }"
      >
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-calendar-days" class="w-6 h-6" />
          {{ schedule.date.datetime }}
        </div>
      </div>
      <p
        v-if="schedule.date.description"
        class="mt-3 text-base text-gray-700 dark:text-gray-300 font-medium"
        :style="{
          color: schedule.date.backgroundColor,
        }"
      >
        {{ schedule.date.description }}
      </p>
    </div>

    <!-- Shifts -->
    <div class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
      <ShiftCard
        v-if="hasDayHighlighted"
        shift-type="day"
        :agents="schedule.day"
        :highlighted-agents="highlightedAgents"
      />
      <ShiftCard
        v-if="hasNightHighlighted"
        shift-type="night"
        :agents="schedule.night"
        :highlighted-agents="highlightedAgents"
      />
    </div>
  </div>
</template>
