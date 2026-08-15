<script setup lang="ts">
import { BOOKING_URL } from '~~/shared/constant';
import { getSpecialDateKind } from '~~/shared/date-meta';

const { todaySchedule, schedules, hasError } = await useSchedules();

// 今日是否店休（灰底）；店休與「今日無排班」分開呈現
const isTodayClosed = computed(
  () => getSpecialDateKind(todaySchedule.value?.date.backgroundColor ?? '') === 'closed'
);

const todayCounts = computed(() => ({
  day: todaySchedule.value?.day.length ?? 0,
  night: todaySchedule.value?.night.length ?? 0,
}));

// 近日預覽：今日之後、最多 4 天
const upcomingSchedules = computed(() => {
  const todayIso = getTodayIso();
  return schedules.value
    .filter((schedule) => schedule.date.iso !== todayIso && isTodayOrFuture(schedule.date.iso))
    .slice(0, 4);
});

const appConfig = useAppConfig();
useHead({
  title: `${appConfig.title} - 今日班表`,
});
</script>

<template>
  <UContainer class="py-8 md:py-12">
    <GreetingHeader :today="todaySchedule" />

    <!-- 載入失敗：與「今日無排班」分開呈現，否則 Sheets 掛掉會被誤讀成今天沒班 -->
    <EmptyState
      v-if="hasError"
      class="mb-12"
      kanji="無"
      title="無法載入班表"
      subtitle="請稍後再重新整理頁面。"
      data-testid="home-error"
    />

    <!-- 今日早 / 晚班 -->
    <section
      v-else-if="todaySchedule && !isTodayClosed"
      class="mb-12"
      aria-labelledby="home-today-heading"
    >
      <div class="mb-6 flex items-center gap-3">
        <span class="kanji-mark serif" aria-hidden="true">今</span>
        <h2 id="home-today-heading" class="stamp-label shrink-0">
          TODAY · 本日のシフト
        </h2>
        <span class="h-px flex-1 bg-rule" />
        <span class="stamp-label mono tnum shrink-0 max-[920px]:hidden">
          EARLY {{ padZero(todayCounts.day) }} ／ LATE {{ padZero(todayCounts.night) }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-6 max-[920px]:grid-cols-1">
        <ShiftColumn type="day" :agents="todaySchedule.day" />
        <ShiftColumn type="night" :agents="todaySchedule.night" />
      </div>
    </section>

    <!-- 今日店休 -->
    <EmptyState
      v-else-if="isTodayClosed"
      class="mb-12"
      kanji="休"
      title="本日店休"
      subtitle="今日沒有排班，明日再見。"
    />

    <!-- 今日無排班 -->
    <EmptyState
      v-else
      class="mb-12"
      kanji="休"
      title="今日無排班"
      subtitle="今天沒有值班安排，好好休息吧。"
    />

    <!-- 近日のシフト -->
    <section
      v-if="!hasError && upcomingSchedules.length > 0"
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
          :key="schedule.date.iso"
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
  </UContainer>
</template>
