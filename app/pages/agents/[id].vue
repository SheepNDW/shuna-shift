<script setup lang="ts">
const route = useRoute();

const agentId = computed(() => route.params.id as string);

const { agentInfo, agentSchedules } = useAgent(agentId.value);

if (!agentInfo.value) {
  await navigateTo('/shifts', { replace: true });
}

const appConfig = useAppConfig();
useHead({
  title: `${appConfig.title} | ${agentInfo.value?.name} - 排班資訊 `,
  meta: [
    {
      name: 'description',
      content: `查看探員 ${agentInfo.value?.name} 的詳細資訊及排班記錄`,
    },
  ],
});
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-6">
      <UButton to="/shifts" icon="i-heroicons-arrow-left" variant="ghost" color="neutral" size="lg">
        返回班表
      </UButton>
    </div>

    <AgentProfile v-if="agentInfo" :agent-info="agentInfo" />

    <!-- 排班記錄區 -->
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center gap-2 mb-6">
        <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-pink-500" />
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">近期排班記錄</h2>
      </div>

      <div v-if="agentSchedules.length === 0" class="text-center py-12">
        <UIcon name="i-heroicons-calendar-days" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p class="text-gray-600 dark:text-gray-400 mb-4">目前沒有排班記錄</p>
        <UButton to="/shifts" variant="soft" color="primary"> 查看完整班表 </UButton>
      </div>

      <!-- 排班列表 -->
      <div v-else class="space-y-4">
        <AgentScheduleCard
          v-for="(schedule, index) in agentSchedules"
          :key="index"
          :schedule="schedule"
        />
      </div>
    </div>

    <BackToTop />
  </UContainer>
</template>
