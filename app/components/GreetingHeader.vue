<script setup lang="ts">
// 首頁 hero band：時段招呼語 + 印章式今日日期框。
// 招呼語與日期皆依使用者本地時間決定，故整體包進 ClientOnly 避免 hydration mismatch。
const { today = null } = defineProps<{
  /** 今日班表，僅用於取出特殊日說明（如生誕祭）；無排班時為 null */
  today?: ShiftSchedule | null;
}>();

const greeting = computed(() => {
  const hour = getCurrentHour();
  if (hour >= 5 && hour < 12) return { ja: 'おはよう', zh: '早安' };
  if (hour >= 12 && hour < 18) return { ja: 'こんにちは', zh: '午安' };
  return { ja: 'こんばんは', zh: '晚安' };
});

const todayLabel = computed(() => getTodayLabel());
const parsedDate = computed(() => parseDateLabel(todayLabel.value));
const weekday = computed(() => getWeekdayLabel(todayLabel.value));
const description = computed(() => today?.date.description ?? '');
</script>

<template>
  <ClientOnly>
    <section class="greeting" aria-label="今日問候">
      <div class="greeting__text">
        <span class="stamp-label greeting__stamp">星期{{ weekday }} · {{ todayLabel }}</span>
        <h1 class="serif greeting__hello">
          {{ greeting.ja }}、<span class="greeting__hello-shu">朱雫</span>
        </h1>
        <p class="greeting__sub">{{ greeting.zh }}，今日當班的探員如下。</p>
      </div>

      <div v-if="parsedDate" class="date-stamp-frame greeting__date">
        <div class="greeting__date-mono">
          <span class="mono tnum greeting__date-num">{{ parsedDate.month }}</span>
          <span class="greeting__date-slash">／</span>
          <span class="mono tnum greeting__date-num">{{ parsedDate.day }}</span>
        </div>
        <div class="serif greeting__date-dow">星期{{ weekday }}</div>
        <span v-if="description" class="greeting__date-desc">{{ description }}</span>
      </div>
    </section>

    <template #fallback>
      <div class="greeting greeting--loading" aria-hidden="true" />
    </template>
  </ClientOnly>
</template>

<style scoped>
.greeting {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 48px;
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--color-rule);
}
.greeting--loading {
  min-height: 200px;
}

.greeting__stamp {
  display: block;
  margin-bottom: 16px;
}
.greeting__hello {
  font-size: clamp(48px, 7vw, 84px);
  line-height: 0.95;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}
.greeting__hello-shu {
  color: var(--color-shu);
}
.greeting__sub {
  margin-top: 16px;
  max-width: 36ch;
  font-size: 18px;
  color: var(--color-ink-soft);
}

/* 印章式日期框，框體四角描邊由 components.css 的 .date-stamp-frame 提供 */
.greeting__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.greeting__date-mono {
  display: flex;
  align-items: baseline;
}
.greeting__date-num {
  font-size: 56px;
  line-height: 1;
  font-weight: 500;
  color: var(--color-ink);
}
.greeting__date-slash {
  margin: 0 2px;
  font-size: 36px;
  color: var(--color-ink-mute);
}
.greeting__date-dow {
  font-size: 16px;
  color: var(--color-ink-soft);
}
.greeting__date-desc {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-shu);
}

@media (max-width: 920px) {
  .greeting {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .greeting__date {
    align-self: start;
  }
}
</style>
