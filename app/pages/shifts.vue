<script setup lang="ts">
const scheduleStore = useScheduleStore();
const { schedules } = storeToRefs(scheduleStore);

// 探員篩選：選中的探員名稱（對應 AGENTS 的鍵值）
const selectedAgents = ref<string[]>([]);
const hasFilter = computed(() => selectedAgents.value.length > 0);
const highlightedAgentNames = computed(() => new Set(selectedAgents.value));

// 今日與未來的班表
const futureSchedules = computed(() =>
  schedules.value.filter((schedule) => isTodayOrFuture(schedule.date.datetime))
);

// 套用探員篩選後的班表：只保留有選中探員值班的日期，但保留該日全體探員
const filteredSchedules = computed(() => {
  if (!hasFilter.value) return futureSchedules.value;

  return futureSchedules.value.filter(
    (schedule) =>
      schedule.day.some((agent) => highlightedAgentNames.value.has(agent.name)) ||
      schedule.night.some((agent) => highlightedAgentNames.value.has(agent.name))
  );
});

const jumpDates = computed(() =>
  filteredSchedules.value.map((schedule) => schedule.date.datetime)
);

// 動態副標：{X} 日 · {首日} – {末日}
const subtitle = computed(() => {
  const list = futureSchedules.value;
  if (list.length === 0) return '近期尚無排班資料';

  const first = list[0]!.date.datetime;
  const last = list[list.length - 1]!.date.datetime;
  return `${list.length} 日 · ${first} – ${last}`;
});

// meta：未篩選顯示總天數；套篩選時明示「篩選 X / 共 Y 日」避免與副標的全範圍混淆
const headerMeta = computed(() => {
  const total = futureSchedules.value.length;
  if (!hasFilter.value) return `${total} 日`;
  return `篩選 ${filteredSchedules.value.length} / 共 ${total} 日`;
});

function scrollToDate(datetime: string): void {
  const element = document.getElementById(`schedule-${datetime}`);
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 從探員頁過來的 ?date=... 自動捲到當日卡片(review M3 — 原本連結是空包彈,
// 落到頁頂)。等 ClientOnly 渲染完 schedule-${date} 節點再呼叫,所以用 watch
// + flush:'post';一次就好,後續使用者切篩選不再自動捲。
const route = useRoute();
const initialDateScrollDone = ref(false);
watch(
  [filteredSchedules, () => route.query.date],
  () => {
    if (initialDateScrollDone.value) return;
    const dateQuery = route.query.date;
    if (typeof dateQuery !== 'string' || !dateQuery) return;
    if (filteredSchedules.value.length === 0) return;
    initialDateScrollDone.value = true;
    nextTick(() => scrollToDate(dateQuery));
  },
  { immediate: true, flush: 'post' }
);

const appConfig = useAppConfig();
useHead({
  title: `${appConfig.title} - 完整班表`,
});
</script>

<template>
  <UContainer class="py-8 md:py-12">
    <PageHeader
      kanji="表"
      label="SHIFT TIMETABLE · 班表"
      title="完整班表"
      :subtitle="subtitle"
      :meta="headerMeta"
    />

    <ClientOnly>
      <FilterBar v-model="selectedAgents" :dates="jumpDates" @jump="scrollToDate" />

      <!-- 班表列表 -->
      <section
        v-if="filteredSchedules.length > 0"
        class="flex flex-col gap-6"
        aria-label="班表列表"
      >
        <DailyScheduleCard
          v-for="schedule in filteredSchedules"
          :id="`schedule-${schedule.date.datetime}`"
          :key="schedule.date.datetime"
          :schedule="schedule"
          :highlighted-agents="hasFilter ? highlightedAgentNames : undefined"
        />
      </section>

      <!-- 篩選無結果 -->
      <div
        v-else-if="hasFilter"
        class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-rule px-6 py-16 text-center"
        data-testid="shifts-empty-filter"
      >
        <span class="empty-kanji" aria-hidden="true">無</span>
        <h2 class="serif text-fs-28 text-ink">找不到班表</h2>
        <p class="max-w-[36ch] text-ink-soft">所選探員在近期沒有排班記錄。</p>
        <button class="btn ghost mt-4" type="button" @click="selectedAgents = []">
          清除篩選 →
        </button>
      </div>

      <!-- 無未來班表 -->
      <div
        v-else
        class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-rule px-6 py-16 text-center"
        data-testid="shifts-empty"
      >
        <span class="empty-kanji" aria-hidden="true">空</span>
        <h2 class="serif text-fs-28 text-ink">沒有未來班表</h2>
        <p class="text-ink-soft">目前沒有已排定的未來班表資料。</p>
      </div>

      <template #fallback>
        <LoadingState />
      </template>
    </ClientOnly>
  </UContainer>
</template>
