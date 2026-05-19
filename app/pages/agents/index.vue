<script setup lang="ts">
import { AGENTS } from '~~/shared/constant';

function groupAgentsByStatus(agents: Agent[]): {
  fullTimeAgents: Agent[];
  partTimeAgents: Agent[];
} {
  const fullTimeAgents: Agent[] = [];
  const partTimeAgents: Agent[] = [];

  agents.forEach((agent) => {
    if (agent.isFullTime) {
      fullTimeAgents.push(agent);
    } else {
      partTimeAgents.push(agent);
    }
  });

  return { fullTimeAgents, partTimeAgents };
}

const agents = Array.from(AGENTS.values());
const { fullTimeAgents, partTimeAgents } = groupAgentsByStatus(agents);

const appConfig = useAppConfig();
useHead({
  title: `${appConfig.title} - 探員圖鑑`,
  meta: [
    {
      name: 'description',
      content: '探索喫茶 朱雫 Maid Café 全部現役探員。',
    },
  ],
});
</script>

<template>
  <UContainer class="py-8 md:py-12">
    <PageHeader
      kanji="員"
      label="AGENTS · 探員圖鑑"
      title="探員圖鑑"
      subtitle="認識所有探員們"
      :meta="`正職 ${fullTimeAgents.length} · 現役 ${partTimeAgents.length}`"
    />

    <!-- 正職探員區 -->
    <section class="mb-16">
      <div class="flex items-center justify-center gap-3 mb-8">
        <div class="h-px flex-1 bg-linear-to-r from-transparent to-pink-300" />
        <div
          class="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-pink-500 to-purple-500 rounded-full shadow-lg"
        >
          <UIcon name="i-heroicons-star" class="w-6 h-6 text-white" />
          <h2 class="text-2xl font-bold text-white">正職探員</h2>
          <UBadge
            color="neutral"
            variant="solid"
            size="lg"
            class="bg-white! text-pink-600!"
          >
            {{ fullTimeAgents.length }}
          </UBadge>
        </div>
        <div class="h-px flex-1 bg-linear-to-l from-transparent to-pink-300" />
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        data-testid="full-time-agents-grid"
      >
        <AgentListCard v-for="agent in fullTimeAgents" :key="agent.id" :agent="agent" />
      </div>
    </section>

    <!-- 非正職探員區 -->
    <section>
      <div class="flex items-center justify-center gap-3 mb-8">
        <div class="h-px flex-1 bg-linear-to-r from-transparent to-blue-300" />
        <div
          class="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg"
        >
          <UIcon name="i-heroicons-users" class="w-6 h-6 text-white" />
          <h2 class="text-2xl font-bold text-white">現役探員</h2>
          <UBadge
            color="neutral"
            variant="solid"
            size="lg"
            class="bg-white! text-blue-600!"
          >
            {{ partTimeAgents.length }}
          </UBadge>
        </div>
        <div class="h-px flex-1 bg-linear-to-l from-transparent to-blue-300" />
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        data-testid="part-time-agents-grid"
      >
        <AgentListCard v-for="agent in partTimeAgents" :key="agent.id" :agent="agent" />
      </div>
    </section>

    <!-- Call to Action -->
    <div class="text-center mt-16">
      <div
        class="inline-block p-1 bg-linear-to-r from-pink-500 to-purple-500 rounded-2xl shadow-2xl"
      >
        <UButton to="/shifts" size="xl" color="neutral" variant="solid" class="px-8 py-4">
          <UIcon name="i-heroicons-calendar-days" class="w-6 h-6" />
          查看班表
        </UButton>
      </div>
      <p class="mt-4 text-sm text-gray-500">查看近期排班資訊</p>
    </div>
  </UContainer>
</template>
