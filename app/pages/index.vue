<script setup lang="ts">
import { BOOKING_URL } from '~~/shared/constant';

const scheduleStore = useScheduleStore();
const { todaySchedule, schedules } = storeToRefs(scheduleStore);

const todayCounts = computed(() => ({
  day: todaySchedule.value?.day.length ?? 0,
  night: todaySchedule.value?.night.length ?? 0,
}));

// 近日預覽：今日之後、最多 4 天
const upcomingSchedules = computed(() => {
  const todayLabel = getTodayLabel();
  return schedules.value
    .filter(
      (schedule) =>
        schedule.date.datetime !== todayLabel && isTodayOrFuture(schedule.date.datetime)
    )
    .slice(0, 4);
});

const pad = (value: number) => String(value).padStart(2, '0');

const appConfig = useAppConfig();
useHead({
  title: `${appConfig.title} - 今日班表`,
});
</script>

<template>
  <UContainer class="py-8 md:py-12">
    <GreetingHeader :today="todaySchedule" />

    <ClientOnly>
      <!-- 今日早 / 晚班 -->
      <section v-if="todaySchedule" class="mb-12" aria-labelledby="home-today-heading">
        <div class="mb-6 flex items-center gap-3">
          <span class="kanji-mark serif" aria-hidden="true">今</span>
          <h2 id="home-today-heading" class="stamp-label shrink-0">
            TODAY · 本日のシフト
          </h2>
          <span class="h-px flex-1 bg-rule" />
          <span class="stamp-label mono tnum shrink-0 max-[920px]:hidden">
            EARLY {{ pad(todayCounts.day) }} ／ LATE {{ pad(todayCounts.night) }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-6 max-[920px]:grid-cols-1">
          <ShiftColumn type="day" :agents="todaySchedule.day" />
          <ShiftColumn type="night" :agents="todaySchedule.night" />
        </div>
      </section>

      <!-- 今日無排班 -->
      <div
        v-else
        class="mb-12 flex flex-col items-center gap-3 rounded-lg border border-dashed border-rule px-6 py-16 text-center"
      >
        <span
          class="serif flex h-22 w-22 items-center justify-center border-[1.5px] border-shu text-[56px] text-shu"
          aria-hidden="true"
        >休</span>
        <h2 class="serif text-fs-28 text-ink">今日無排班</h2>
        <p class="text-ink-soft">今天沒有值班安排，好好休息吧。</p>
      </div>

      <!-- 近日のシフト -->
      <section
        v-if="upcomingSchedules.length > 0"
        class="mb-12"
        aria-labelledby="home-upcoming-heading"
      >
        <div class="mb-6 flex items-center gap-3">
          <span class="serif shrink-0 text-fs-18 text-shu">近日</span>
          <h2 id="home-upcoming-heading" class="stamp-label">UPCOMING · 近日のシフト</h2>
          <span class="h-px flex-1 bg-rule" />
        </div>
        <div class="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
          <UpcomingCard
            v-for="schedule in upcomingSchedules"
            :key="schedule.date.datetime"
            :schedule="schedule"
          />
        </div>
      </section>

      <!-- CTA -->
      <div class="mt-2 flex flex-wrap justify-center gap-3">
        <NuxtLink class="btn ghost" to="/shifts">查看完整班表 →</NuxtLink>
        <a class="btn shu" :href="BOOKING_URL" target="_blank" rel="noopener noreferrer">
          預約座位 →
        </a>
      </div>

      <template #fallback>
        <LoadingState />
      </template>
    </ClientOnly>
  </UContainer>
</template>
