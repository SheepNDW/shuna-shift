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
      <section
        v-if="todaySchedule"
        class="home-today"
        aria-labelledby="home-today-heading"
      >
        <div class="home-today__line">
          <span class="kanji-mark serif" aria-hidden="true">今</span>
          <h2 id="home-today-heading" class="stamp-label home-today__label">
            TODAY · 本日のシフト
          </h2>
          <span class="home-today__rule" />
          <span class="stamp-label mono tnum home-today__counts">
            EARLY {{ pad(todayCounts.day) }} ／ LATE {{ pad(todayCounts.night) }}
          </span>
        </div>

        <div class="home-today__grid">
          <ShiftColumn type="day" :agents="todaySchedule.day" />
          <ShiftColumn type="night" :agents="todaySchedule.night" />
        </div>
      </section>

      <!-- 今日無排班 -->
      <div v-else class="home-empty">
        <span class="serif home-empty__kanji" aria-hidden="true">休</span>
        <h2 class="serif home-empty__title">今日無排班</h2>
        <p class="home-empty__sub">今天沒有值班安排，好好休息吧。</p>
      </div>

      <!-- 近日のシフト -->
      <section
        v-if="upcomingSchedules.length > 0"
        class="home-upcoming"
        aria-labelledby="home-upcoming-heading"
      >
        <div class="home-upcoming__head">
          <span class="serif home-upcoming__kanji">近日</span>
          <h2 id="home-upcoming-heading" class="stamp-label">
            UPCOMING · 近日のシフト
          </h2>
          <span class="home-upcoming__rule" />
        </div>
        <div class="home-upcoming__grid">
          <UpcomingCard
            v-for="schedule in upcomingSchedules"
            :key="schedule.date.datetime"
            :schedule="schedule"
          />
        </div>
      </section>

      <!-- CTA -->
      <div class="home-cta">
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

<style scoped>
/* —— 今日班表 —— */
.home-today {
  margin-bottom: 48px;
}
.home-today__line {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.home-today__label {
  flex-shrink: 0;
}
.home-today__rule {
  flex: 1;
  height: 1px;
  background: var(--color-rule);
}
.home-today__counts {
  flex-shrink: 0;
}
.home-today__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* —— 今日無排班 —— */
.home-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
  padding: 64px 24px;
  text-align: center;
  border: 1px dashed var(--color-rule);
  border-radius: var(--radius-lg);
}
.home-empty__kanji {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  margin-bottom: 4px;
  font-size: 56px;
  color: var(--color-shu);
  border: 1.5px solid var(--color-shu);
}
.home-empty__title {
  font-size: 28px;
  color: var(--color-ink);
}
.home-empty__sub {
  color: var(--color-ink-soft);
}

/* —— 近日預覽 —— */
.home-upcoming {
  margin-bottom: 48px;
}
.home-upcoming__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.home-upcoming__kanji {
  flex-shrink: 0;
  font-size: 18px;
  color: var(--color-shu);
}
.home-upcoming__rule {
  flex: 1;
  height: 1px;
  background: var(--color-rule);
}

.home-upcoming__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

/* —— CTA —— */
.home-cta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

@media (max-width: 920px) {
  .home-today__grid {
    grid-template-columns: 1fr;
  }
  /* 窄螢幕收掉 today 行的 EARLY / LATE 計數，
     避免溢出；班別人數已由 ShiftColumn 標題呈現 */
  .home-today__counts {
    display: none;
  }
}
</style>
