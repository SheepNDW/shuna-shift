<script setup lang="ts">
import { AGENTS } from '~~/shared/constant';
import type { StatisticsResponse } from '~~/shared/types';

const route = useRoute();
const agentId = computed(() => route.params.id as string);

const { agentInfo, agentSchedules } = useAgent(agentId.value);

// 無效 agentId 直接 404;若改用 navigateTo + 繼續跑後續 setup,useFetch / useHead
// 仍會打 API + 把 title 短暫設成「undefined · 排班資訊」。
if (!agentInfo.value) {
  throw createError({
    statusCode: 404,
    statusMessage: '找不到該探員',
    fatal: true,
  });
}

// 近三個月日 / 夜 / 總統計:從 /api/statistics 取得後 find by agentId
const TWO_HOURS = 2 * 60 * 60 * 1000;
const {
  data: statisticsData,
  error: statisticsError,
  status: statisticsStatus,
} = await useFetch<StatisticsResponse>('/api/statistics', {
  key: 'agent-detail-statistics',
  default: () => ({
    statistics: [],
    metadata: { lastUpdated: '', dateRange: { from: '', to: '' }, totalSchedules: 0 },
  }),
  getCachedData(key, nuxtApp) {
    const cached = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    if (!cached) return undefined;

    const fetchedAt = new Date(cached.metadata?.lastUpdated).getTime();
    if (Number.isNaN(fetchedAt) || Date.now() - fetchedAt > TWO_HOURS) {
      return undefined;
    }

    return cached;
  },
});

// 失敗或還在 pending 時回傳 null,AgentProfile 會渲染「—」骨架;
// 避免把「fetch 失敗 / timeout / invalid payload」偽裝成「真的零班」。
const stats = computed(() => {
  if (statisticsError.value || statisticsStatus.value === 'pending') {
    return { dayCount: null, nightCount: null, total: null };
  }
  const found = statisticsData.value?.statistics.find((s) => s.agentId === agentId.value);
  return {
    dayCount: found?.dayCount ?? 0,
    nightCount: found?.nightCount ?? 0,
    total: found?.total ?? 0,
  };
});

// AGENT FILE 編號:依 AGENTS Map 插入順序為基準,從 001 起算
const fileNumber = computed(() => {
  const values = Array.from(AGENTS.values());
  const index = values.findIndex((agent) => agent.id === agentId.value);
  return String(index >= 0 ? index + 1 : 0).padStart(3, '0');
});

const backBarStamp = computed(() =>
  agentInfo.value?.isFullTime ? 'FULL-TIME · 正職' : 'ACTIVE · 現役'
);

useHead({
  title: `${agentInfo.value?.name} · 排班資訊`,
  meta: [
    {
      name: 'description',
      content: `查看探員 ${agentInfo.value?.name} 的詳細資訊與排班記錄`,
    },
  ],
});
</script>

<template>
  <UContainer class="py-8 md:py-12">
    <template v-if="agentInfo">
      <PageBackBar to="/agents" label="探員圖鑑" :stamp="backBarStamp" />

      <AgentProfile :agent="agentInfo" :file-number="fileNumber" :stats="stats" />

      <section data-testid="agent-schedule">
        <header class="mb-6 flex items-center gap-3">
          <span class="serif text-fs-22 text-ink">近期排班</span>
          <span class="h-px flex-1 bg-rule-2" aria-hidden="true" />
          <span class="stamp-label">UPCOMING · {{ agentInfo.name }}</span>
        </header>

        <EmptyState
          v-if="agentSchedules.length === 0"
          kanji="空"
          title="近期無排班"
          subtitle="這段期間沒有安排到班次。"
          data-testid="agent-schedule-empty"
        >
          <template #action>
            <NuxtLink to="/shifts" class="btn ghost">查看完整班表 →</NuxtLink>
          </template>
        </EmptyState>

        <ul
          v-else
          class="overflow-hidden rounded-lg border border-rule bg-surface"
          data-testid="agent-schedule-list"
        >
          <AgentScheduleCard
            v-for="(schedule, index) in agentSchedules"
            :key="index"
            :schedule="schedule"
          />
        </ul>
      </section>
    </template>
  </UContainer>
</template>
