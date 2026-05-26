<script setup lang="ts">
import { AGENTS } from '~~/shared/constant';
import type { Agent } from '~~/shared/types';

const agents = Array.from(AGENTS.values());
// 卒業優先：先抽出卒業，再從剩下的探員區分正職/現役，避免一位探員同時出現在兩段
const graduatedAgents = agents.filter((agent): agent is Agent => agent.isGraduated === true);
const activeAgents = agents.filter((agent) => !agent.isGraduated);
const fullTimeAgents = activeAgents.filter((agent): agent is Agent => agent.isFullTime === true);
const partTimeAgents = activeAgents.filter((agent) => !agent.isFullTime);

const appConfig = useAppConfig();
useHead({
  title: `${appConfig.title} - 探員圖鑑`,
  meta: [
    {
      name: 'description',
      content: '探索喫茶 朱雫 Maid Café 正職、現役與卒業探員。',
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
      :meta="`正職 ${fullTimeAgents.length} · 現役 ${partTimeAgents.length} · 卒業 ${graduatedAgents.length}`"
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

    <AgentSection
      kanji="卒"
      label="GRADUATED · 卒業探員"
      desc="曾經駐店・感謝相伴"
      :agents="graduatedAgents"
      data-testid="agents-section-graduated"
    />
  </UContainer>
</template>
