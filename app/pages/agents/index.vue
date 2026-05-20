<script setup lang="ts">
import { AGENTS } from '~~/shared/constant';
import type { Agent } from '~~/shared/types';

const agents = Array.from(AGENTS.values());
const fullTimeAgents = agents.filter((agent): agent is Agent => agent.isFullTime === true);
const partTimeAgents = agents.filter((agent) => !agent.isFullTime);

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
      subtitle="認識朱雫每一位探員,點擊查看排班與 Instagram。"
      :meta="`正職 ${fullTimeAgents.length} · 現役 ${partTimeAgents.length}`"
    />

    <AgentSection
      kanji="正"
      label="FULL-TIME · 正職探員"
      desc="店內招牌・長期駐店"
      :agents="fullTimeAgents"
      data-testid="agents-section-full-time"
    />

    <AgentSection
      kanji="現"
      label="ACTIVE · 現役探員"
      desc="輪班駐店探員"
      :agents="partTimeAgents"
      data-testid="agents-section-part-time"
    />
  </UContainer>
</template>
