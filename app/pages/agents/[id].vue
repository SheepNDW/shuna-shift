<script setup lang="ts">
import { AGENTS } from '~~/shared/constant';

const route = useRoute();
const scheduleStore = useScheduleStore();

const agentId = computed(() => route.params.id as string);

const agentInfo = computed(() => {
  const agent = Array.from(AGENTS.values()).find((a) => a.id === agentId.value);
  if (!agent) {
    navigateTo('/shifts');
    return null;
  }
  return agent;
});

// 篩選該探員的排班資料
interface AgentScheduleItem {
  date: {
    datetime: string;
    backgroundColor: string;
    description: string;
  };
  dayShifts: { name: string; textColor: string }[];
  nightShifts: { name: string; textColor: string }[];
}

const agentSchedules = computed<AgentScheduleItem[]>(() => {
  if (!agentInfo.value) return [];

  return scheduleStore.schedules
    .map((schedule) => {
      const dayShifts = schedule.day.filter((agent) => {
        const name = agent.name.split('(')[0]?.trim() || agent.name;
        return AGENTS.get(name)?.id === agentId.value;
      });

      const nightShifts = schedule.night.filter((agent) => {
        const name = agent.name.split('(')[0]?.trim() || agent.name;
        return AGENTS.get(name)?.id === agentId.value;
      });

      if (dayShifts.length > 0 || nightShifts.length > 0) {
        return {
          date: schedule.date,
          dayShifts,
          nightShifts,
        };
      }
      return null;
    })
    .filter((item) => item !== null);
});

useHead({
  title: `${agentInfo.value?.name} - 探員資訊 | 喫茶 朱雫`,
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

    <!-- 個人資訊區 -->
    <div v-if="agentInfo" class="flex flex-col items-center mb-12">
      <div class="relative w-40 h-40 md:w-48 md:h-48 mb-6">
        <div
          class="w-full h-full overflow-hidden rounded-full bg-linear-to-br from-pink-200 to-purple-200 dark:from-pink-900 dark:to-purple-900 ring-4 ring-pink-100 dark:ring-pink-900/50 hover:ring-pink-300 dark:hover:ring-pink-700 transition-all"
        >
          <NuxtImg
            :src="agentInfo.picture"
            :alt="agentInfo.name"
            class="w-full h-full object-cover"
          />
        </div>
        <div
          class="absolute -bottom-2 -right-2 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800"
        >
          <UIcon name="i-heroicons-star-solid" class="w-6 h-6 text-white" />
        </div>
      </div>

      <h1
        class="text-4xl font-bold mb-4 bg-linear-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
      >
        {{ agentInfo.name }}
      </h1>

      <a
        v-if="agentInfo.instagram"
        :href="agentInfo.instagram"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-pink-500 to-purple-500 text-white font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
      >
        <UIcon name="i-mdi-instagram" class="w-5 h-5" />
        <span>Instagram</span>
      </a>
    </div>

    <!-- 排班記錄區 -->
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center gap-2 mb-6">
        <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-pink-500" />
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">排班記錄</h2>
      </div>

      <!-- 空狀態 -->
      <div v-if="agentSchedules.length === 0" class="text-center py-12">
        <UIcon name="i-heroicons-calendar-days" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p class="text-gray-600 dark:text-gray-400 mb-4">目前沒有排班記錄</p>
        <UButton to="/shifts" variant="soft" color="primary"> 查看完整班表 </UButton>
      </div>

      <!-- 排班列表 -->
      <div v-else class="space-y-4">
        <UCard
          v-for="(schedule, index) in agentSchedules"
          :key="index"
          class="hover:shadow-lg transition-shadow"
        >
          <!-- 日期標題 -->
          <div class="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">
              {{ schedule.date.datetime }}
            </h3>
            <p
              v-if="schedule.date.description"
              class="text-sm text-gray-600 dark:text-gray-400 mt-1"
            >
              {{ schedule.date.description }}
            </p>
          </div>

          <!-- 班別資訊 -->
          <div class="space-y-3">
            <!-- 早班 -->
            <div
              v-for="(shift, shiftIndex) in schedule.dayShifts"
              :key="`day-${shiftIndex}`"
              class="flex items-center gap-3"
            >
              <UIcon name="i-heroicons-sun" class="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p class="font-medium" :style="{ color: shift.textColor || 'inherit' }">
                  早班 13:30 ~ 17:30
                </p>
              </div>
            </div>

            <!-- 晚班 -->
            <div
              v-for="(shift, shiftIndex) in schedule.nightShifts"
              :key="`night-${shiftIndex}`"
              class="flex items-center gap-3"
            >
              <UIcon name="i-heroicons-moon" class="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <p class="font-medium" :style="{ color: shift.textColor || 'inherit' }">
                  晚班 17:30 ~ 21:30
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- 回到頂部按鈕 -->
    <BackToTop />
  </UContainer>
</template>
