<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui';
import { AGENTS } from '~~/shared/constant';

type AgentSelectOption = SelectMenuItem & { label: string; name: string };

const selectedAgent = defineModel<AgentSelectOption[]>({ required: true });

const handleClear = () => {
  selectedAgent.value = [];
};

const removeAgent = (name: string) => {
  if (!selectedAgent.value) return;

  selectedAgent.value = selectedAgent.value.filter((agent) => agent.name !== name);
};

const agents: AgentSelectOption[] = [...AGENTS].map((item) => {
  return {
    label: item[1].name,
    name: item[0],
  };
});
</script>

<template>
  <div class="max-w-4xl mx-auto mb-8">
    <div
      class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div class="flex flex-col sm:flex-row gap-4 items-center">
        <div class="flex items-center gap-2 shrink-0">
          <UIcon name="i-heroicons-funnel" class="w-5 h-5 text-gray-500" />
          <span class="font-medium text-gray-700 dark:text-gray-300">探員篩選：</span>
        </div>
        <div class="flex-1 w-full sm:w-auto">
          <USelectMenu
            v-model="selectedAgent"
            :items="agents"
            placeholder="選擇探員..."
            size="lg"
            class="w-full"
            multiple
          />
        </div>
        <UButton
          v-if="selectedAgent && selectedAgent.length > 0"
          color="neutral"
          variant="soft"
          size="lg"
          data-testid="clear-filter-btn"
          @click="handleClear"
        >
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          清除篩選
        </UButton>
      </div>

      <!-- Active Filter Display -->
      <div
        v-if="selectedAgent && selectedAgent.length > 0"
        class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">目前顯示：</span>
          <UBadge
            v-for="agent in selectedAgent"
            :key="agent.name"
            color="primary"
            variant="subtle"
            size="lg"
            class="flex items-center gap-1"
            data-testid="agent-badge"
          >
            <UIcon name="i-heroicons-user" class="w-4 h-4" />
            {{ agent.label }}
            <UButton
              icon="i-heroicons-x-mark"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="移除此探員"
              data-testid="remove-agent-btn"
              @click.stop="removeAgent(agent.name)"
            />
          </UBadge>
          <span class="text-sm text-gray-600 dark:text-gray-400">的班表</span>
        </div>
      </div>
    </div>
  </div>
</template>
