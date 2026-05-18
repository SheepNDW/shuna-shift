<script setup lang="ts">
const scheduleStore = useScheduleStore();

const { todaySchedule } = storeToRefs(scheduleStore);

const appConfig = useAppConfig();
useHead({
  title: `${appConfig.title} - 今日班表`,
});
</script>

<template>
  <UContainer class="py-8 md:py-12">
    <GreetingHeader />
    <ClientOnly>
      <div v-if="todaySchedule" class="max-w-6xl mx-auto">
        <!-- Date Card -->
        <div class="text-center mb-10">
          <div
            class="inline-block px-8 py-4 rounded-2xl text-3xl font-bold shadow-lg border-4 border-white transform hover:scale-105 transition-transform"
            :style="{
              backgroundColor: todaySchedule.date.backgroundColor || '#f3f4f6',
            }"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-calendar-days" class="w-8 h-8" />
              {{ todaySchedule.date.datetime }}
            </div>
          </div>
          <p
            v-if="todaySchedule.date.description"
            class="mt-4 text-lg text-gray-700 font-medium"
            :style="{
              color: todaySchedule.date.backgroundColor,
            }"
          >
            {{ todaySchedule.date.description }}
          </p>
        </div>

        <!-- Day Shift Section -->
        <div class="mb-12">
          <div class="flex items-center justify-center gap-3 mb-6">
            <div class="h-px flex-1 bg-linear-to-r from-transparent to-yellow-300" />
            <div
              class="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg"
            >
              <UIcon name="i-heroicons-sun" class="w-6 h-6 text-white" />
              <h3 class="text-2xl font-bold text-white">早班</h3>
              <UBadge color="neutral" variant="solid" size="lg">
                {{ todaySchedule.day.length }}
              </UBadge>
            </div>
            <div class="h-px flex-1 bg-linear-to-l from-transparent to-yellow-300" />
          </div>

          <div
            v-if="todaySchedule.day.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AgentCard
              v-for="agent in todaySchedule.day"
              :key="agent.name"
              :name="agent.name"
              :text-color="agent.textColor"
            />
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-2xl shadow-md"
          >
            <UIcon name="i-heroicons-sun" class="w-16 h-16 text-gray-300 mb-4" />
            <p class="text-center text-gray-500 text-lg">今日早班無排班</p>
          </div>
        </div>

        <!-- Night Shift Section -->
        <div class="mb-12">
          <div class="flex items-center justify-center gap-3 mb-6">
            <div class="h-px flex-1 bg-linear-to-r from-transparent to-indigo-300" />
            <div
              class="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg"
            >
              <UIcon name="i-heroicons-moon" class="w-6 h-6 text-white" />
              <h3 class="text-2xl font-bold text-white">晚班</h3>
              <UBadge color="neutral" variant="solid" size="lg">
                {{ todaySchedule.night.length }}
              </UBadge>
            </div>
            <div class="h-px flex-1 bg-linear-to-l from-transparent to-indigo-300" />
          </div>

          <div
            v-if="todaySchedule.night.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AgentCard
              v-for="agent in todaySchedule.night"
              :key="agent.name"
              :name="agent.name"
              :text-color="agent.textColor"
            />
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-2xl shadow-md"
          >
            <UIcon
              name="i-heroicons-moon"
              class="w-16 h-16 text-gray-300 mb-4"
            />
            <p class="text-center text-gray-500 text-lg">今日晚班無排班</p>
          </div>
        </div>

        <ColorLegend />

        <!-- Call to Action -->
        <div class="text-center mt-12">
          <div
            class="inline-block p-1 bg-linear-to-r from-pink-500 to-purple-500 rounded-2xl shadow-2xl"
          >
            <UButton to="/shifts" size="xl" color="neutral" variant="solid" class="px-8 py-4">
              <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 mr-2" />
              查看完整班表
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 ml-2" />
            </UButton>
          </div>
          <p class="mt-4 text-sm text-gray-500 ">查看未來幾天的排班資訊</p>
        </div>
      </div>

      <!-- Empty State (no schedule today) -->
      <div v-else class="flex flex-col items-center justify-center py-20 max-w-2xl mx-auto">
        <div
          class="bg-white rounded-3xl p-12 shadow-xl text-center border-4 border-dashed border-gray-300 "
        >
          <UIcon
            name="i-heroicons-calendar-days"
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
          />
          <h3 class="text-2xl font-bold text-gray-700 mb-2">今日無排班</h3>
          <p class="text-gray-600 mb-6">今天沒有值班安排，好好休息吧！</p>
          <UButton to="/shifts" color="primary" size="lg">
            <UIcon name="i-heroicons-calendar-days" class="w-5 h-5 mr-2" />
            查看完整班表
          </UButton>
        </div>
      </div>

      <template #fallback>
        <LoadingState />
      </template>
    </ClientOnly>
  </UContainer>
</template>
