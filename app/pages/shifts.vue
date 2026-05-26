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
  // 捲動屬 DOM 操作，SSR 階段無 document —— 防禦性提前略過。
  if (import.meta.server) return;
  const element = document.getElementById(`schedule-${datetime}`);
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const route = useRoute();

// DailyScheduleCard 的 scroll-mt-24,捲動定位的目標位移(距視窗頂 96px)。
const SCROLL_MARGIN_TOP = 96;

// 從探員頁帶 ?date=... 進來時自動捲到當日卡片。需處理兩點:
// (1) 班表清單包在 <ClientOnly> 內,卡片掛載後才進 DOM;
// (2) SPA 導航時 Nuxt router 會在導航結束後把頁面捲回頂端,蓋掉我們的捲動。
// 故以 rAF 在 3 秒內持續校正:卡片未就位則等待、被 router 歸零則再捲回,
// 連續對齊數幀(router 只歸零一次)後即停止;逾時則安靜放棄。
function scrollToDateWhenReady(datetime: string): void {
  const deadline = Date.now() + 3000;
  let stableFrames = 0;
  const tick = (): void => {
    const element = document.getElementById(`schedule-${datetime}`);
    if (element) {
      const offset = element.getBoundingClientRect().top - SCROLL_MARGIN_TOP;
      if (Math.abs(offset) <= 2) {
        if (++stableFrames >= 3) return;
      } else {
        stableFrames = 0;
        element.scrollIntoView({ block: 'start' });
      }
    }
    if (Date.now() < deadline) requestAnimationFrame(tick);
  };
  tick();
}

// onMounted 僅在 client 執行,天然避開 SSR;每次進入 /shifts 觸發一次。
onMounted(() => {
  const dateQuery = route.query.date;
  if (typeof dateQuery === 'string' && dateQuery) {
    scrollToDateWhenReady(dateQuery);
  }
});

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
      <EmptyState
        v-else-if="hasFilter"
        kanji="無"
        title="找不到班表"
        subtitle="所選探員在近期沒有排班記錄。"
        data-testid="shifts-empty-filter"
      >
        <template #action>
          <button class="btn ghost" type="button" @click="selectedAgents = []">
            清除篩選 →
          </button>
        </template>
      </EmptyState>

      <!-- 無未來班表 -->
      <EmptyState
        v-else
        kanji="空"
        title="沒有未來班表"
        subtitle="目前沒有已排定的未來班表資料。"
        data-testid="shifts-empty"
      />

      <ColorLegend v-if="filteredSchedules.length > 0" class="mt-8" />

      <template #fallback>
        <LoadingState />
      </template>
    </ClientOnly>
  </UContainer>
</template>
