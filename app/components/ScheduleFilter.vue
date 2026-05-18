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

const preferredAgents: string[] = ['景子', '和実', '音', '芽', '百夜'];

const agents: AgentSelectOption[] = [...AGENTS]
  .map((item) => ({
    label: item[1].name,
    name: item[0],
    isFullTime: item[1].isFullTime ?? false,
  }))
  .sort((a, b) => {
    // 1. 正職排最前面
    if (a.isFullTime && !b.isFullTime) return -1;
    if (!a.isFullTime && b.isFullTime) return 1;

    // 2. 偏好探員排在正職之後
    const aPreferredIndex = preferredAgents.indexOf(a.name);
    const bPreferredIndex = preferredAgents.indexOf(b.name);
    const aPreferred = aPreferredIndex !== -1;
    const bPreferred = bPreferredIndex !== -1;

    if (aPreferred && !bPreferred) return -1;
    if (!aPreferred && bPreferred) return 1;

    // 3. 如果都是偏好，按照 preferredAgents 的順序排列
    if (aPreferred && bPreferred) {
      return aPreferredIndex - bPreferredIndex;
    }

    // 4. 其他探員保持原順序
    return 0;
  });
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      <div class="flex items-center gap-2 shrink-0">
        <UIcon name="i-heroicons-funnel" class="w-5 h-5 text-gray-500" />
        <span class="font-medium text-gray-700">探員篩選：</span>
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
      class="mt-4 pt-4 border-t border-gray-200"
    >
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm text-gray-600">目前顯示：</span>
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
        <span class="text-sm text-gray-600">的班表</span>
      </div>
    </div>
  </div>
</template>
