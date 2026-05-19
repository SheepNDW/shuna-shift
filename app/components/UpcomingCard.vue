<script setup lang="ts">
// 首頁底部「近日のシフト」預覽卡：日期 + 早 / 晚班人數與前兩位探員。
const { schedule } = defineProps<{
  schedule: ShiftSchedule;
}>();

const parsedDate = computed(() => parseDateLabel(schedule.date.datetime));
const weekday = computed(() => getWeekdayLabel(schedule.date.datetime));

/** 取班別前兩位探員名稱，超過則加省略號；無人時回傳「—」 */
function previewNames(list: { name: string }[]): string {
  if (list.length === 0) return '—';
  const head = list
    .slice(0, 2)
    .map((agent) => agent.name)
    .join('、');
  return list.length > 2 ? `${head}…` : head;
}

const dayCount = computed(() => String(schedule.day.length).padStart(2, '0'));
const nightCount = computed(() => String(schedule.night.length).padStart(2, '0'));
const dayNames = computed(() => previewNames(schedule.day));
const nightNames = computed(() => previewNames(schedule.night));
</script>

<template>
  <NuxtLink class="upcoming-card" to="/shifts">
    <div class="upcoming-card__date">
      <span v-if="parsedDate" class="mono tnum upcoming-card__md">
        {{ parsedDate.month }}/{{ parsedDate.day }}
      </span>
      <span class="serif upcoming-card__dow">星期{{ weekday }}</span>
    </div>

    <div class="upcoming-card__shifts">
      <div class="upcoming-card__row">
        <span class="upcoming-card__pill upcoming-card__pill--day">
          <ShiftGlyph type="day" />
        </span>
        <span class="mono tnum upcoming-card__num">{{ dayCount }}</span>
        <span class="upcoming-card__names">{{ dayNames }}</span>
      </div>
      <div class="upcoming-card__row">
        <span class="upcoming-card__pill upcoming-card__pill--night">
          <ShiftGlyph type="night" />
        </span>
        <span class="mono tnum upcoming-card__num">{{ nightCount }}</span>
        <span class="upcoming-card__names">{{ nightNames }}</span>
      </div>
    </div>

    <span v-if="schedule.date.description" class="stamp-label upcoming-card__note">
      ※ {{ schedule.date.description }}
    </span>
  </NuxtLink>
</template>

<style scoped>
.upcoming-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  transition: border-color 0.15s, transform 0.1s;
}
.upcoming-card:hover {
  border-color: var(--color-ink-soft);
  transform: translateY(-1px);
}

.upcoming-card__date {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-rule-2);
}
.upcoming-card__md {
  font-size: 22px;
  font-weight: 500;
  color: var(--color-ink);
}
.upcoming-card__dow {
  font-size: 14px;
  color: var(--color-ink-soft);
}

.upcoming-card__shifts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.upcoming-card__row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}
.upcoming-card__pill {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 6px;
  border: 1px solid;
  border-radius: 50%;
}
.upcoming-card__pill--day {
  color: var(--color-day-deep);
  background: var(--color-day-soft);
  border-color: var(--color-day);
}
.upcoming-card__pill--night {
  color: var(--color-night-deep);
  background: var(--color-night-soft);
  border-color: var(--color-night);
}
.upcoming-card__num {
  width: 20px;
  color: var(--color-ink-soft);
}
.upcoming-card__names {
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upcoming-card__note {
  color: var(--color-shu);
}
</style>
