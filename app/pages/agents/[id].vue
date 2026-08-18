<script setup lang="ts">
import { AGENTS } from '~~/shared/constant';

const route = useRoute();
const agentId = computed(() => route.params.id as string);

const { agentInfo, agentSchedules, hasError: hasScheduleError } = await useAgent(agentId.value);

// 無效 agentId 直接 404;若改用 navigateTo + 繼續跑後續 setup,useStatistics / useHead
// 仍會打 API + 把 title 短暫設成「undefined · 排班資訊」。
//
// 檢查點放在 useAgent 之後:agentInfo 本身只查 AGENTS 常數,但班表是全站共用的
// 那一份(footer 也在用),提早檢查省不下任何請求。
if (!agentInfo.value) {
  throw createError({
    statusCode: 404,
    statusMessage: '找不到該探員',
    // 錯誤頁只會呈現 data.userMessage,不讀 statusMessage(理由見 app/error.vue)
    data: { userMessage: '找不到這位探員，網址中的代號可能打錯了。' },
    fatal: true,
  });
}

// 近三個月日 / 夜 / 總統計:從 /api/statistics 取得後 find by agentId
const {
  statistics,
  hasError: hasStatisticsError,
  isPending: isStatisticsPending,
} = await useStatistics();

// 失敗或還在 pending 時回傳 null,AgentProfile 會渲染「—」骨架;
// 避免把「fetch 失敗 / timeout / invalid payload」偽裝成「真的零班」。
const stats = computed(() => {
  if (hasStatisticsError.value || isStatisticsPending.value) {
    return { dayCount: null, nightCount: null, total: null };
  }
  const found = statistics.value.find((s) => s.agentId === agentId.value);
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

useSeo({
  title: `${agentInfo.value?.name} · 排班資訊`,
  description: `查看探員 ${agentInfo.value?.name} 的詳細資訊與排班記錄。`,
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

        <!-- 載入失敗與「真的零班」分開呈現。兩者都渲染成「近期無排班」的話,
             Sheets 掛掉時這頁會很有自信地宣告這位探員沒班 —— 而這頁是 SSR,
             這句錯誤斷言會直接烘進首屏 HTML 被爬蟲收走。 -->
        <EmptyState
          v-if="hasScheduleError"
          kanji="無"
          title="無法載入班表"
          subtitle="請稍後再重新整理頁面。"
          data-testid="agent-schedule-error"
        />

        <EmptyState
          v-else-if="agentSchedules.length === 0"
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
