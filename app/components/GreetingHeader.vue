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
    <section
      class="mb-10 grid grid-cols-[1fr_auto] items-end gap-12 border-b border-rule pb-10 max-[920px]:grid-cols-1 max-[920px]:gap-6"
      aria-label="今日問候"
    >
      <div>
        <span class="stamp-label mb-4 block">星期{{ weekday }} · {{ todayLabel }}</span>
        <h1
          class="serif text-[clamp(48px,7vw,84px)] leading-[0.95] tracking-[-0.02em] text-ink"
          data-testid="greeting-hello"
        >
          {{ greeting.ja }}、<span class="text-shu">朱雫</span>
        </h1>
        <p class="mt-4 max-w-[36ch] text-fs-18 text-ink-soft" data-testid="greeting-sub">
          {{ greeting.zh }}，今日當班的探員如下。
        </p>
      </div>

      <div
        v-if="parsedDate"
        class="date-stamp-frame flex flex-col items-center gap-1 max-[920px]:self-start"
      >
        <div class="flex items-baseline">
          <span
            class="mono tnum text-[56px] font-medium leading-none text-ink"
            data-testid="greeting-date-num"
          >
            {{ parsedDate.month }}
          </span>
          <span class="mx-0.5 text-fs-36 text-ink-mute">／</span>
          <span
            class="mono tnum text-[56px] font-medium leading-none text-ink"
            data-testid="greeting-date-num"
          >
            {{ parsedDate.day }}
          </span>
        </div>
        <div class="serif text-fs-16 text-ink-soft" data-testid="greeting-date-dow">
          星期{{ weekday }}
        </div>
        <span
          v-if="description"
          class="mt-1.5 text-fs-13 text-shu"
          data-testid="greeting-date-desc"
        >
          {{ description }}
        </span>
      </div>
    </section>

    <template #fallback>
      <div class="mb-10 min-h-[200px]" aria-hidden="true" />
    </template>
  </ClientOnly>
</template>
