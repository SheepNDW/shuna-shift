<script setup lang="ts">
const scheduleStore = useScheduleStore();
const { schedules, hasError } = storeToRefs(scheduleStore);

// 探員篩選：選中的探員名稱（對應 AGENTS 的鍵值）
const selectedAgents = ref<string[]>([]);
const hasFilter = computed(() => selectedAgents.value.length > 0);
const highlightedAgentNames = computed(() => new Set(selectedAgents.value));

// 今日與未來的班表
const futureSchedules = computed(() =>
  schedules.value.filter((schedule) => isTodayOrFuture(schedule.date.iso))
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
  filteredSchedules.value.map((schedule) => ({
    iso: schedule.date.iso,
    label: schedule.date.datetime,
  }))
);

// 動態副標：{X} 日 · {首日} – {末日}
// 載入失敗時回傳空字串（PageHeader 會整段不渲染）：此時 futureSchedules 必為空，
// 照常算會變成「近期尚無排班資料 / 0 日」，就顯示在下方「無法載入班表」的正上方，
// 等於在斷言一件我們其實不知道的事。
const subtitle = computed(() => {
  if (hasError.value) return '';

  const list = futureSchedules.value;
  if (list.length === 0) return '近期尚無排班資料';

  const first = list[0]!.date.datetime;
  const last = list[list.length - 1]!.date.datetime;
  return `${list.length} 日 · ${first} – ${last}`;
});

// meta：未篩選顯示總天數；套篩選時明示「篩選 X / 共 Y 日」避免與副標的全範圍混淆
const headerMeta = computed(() => {
  if (hasError.value) return '';

  const total = futureSchedules.value.length;
  if (!hasFilter.value) return `${total} 日`;
  return `篩選 ${filteredSchedules.value.length} / 共 ${total} 日`;
});

// 卡片的 DOM id 以 ISO 日期為錨（`schedule-2026-08-31`）。用「X月Y日」標籤當 id
// 的話，歷史班表跨年累積時同一個標籤會出現兩張卡片而撞 id。
function scrollToDate(iso: string): void {
  // 捲動屬 DOM 操作，SSR 階段無 document —— 防禦性提前略過。
  if (import.meta.server) return;
  const element = document.getElementById(`schedule-${iso}`);
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const route = useRoute();

// 捲動定位的目標位移 = 卡片自己的 scroll-margin-top。
// 直接讀 computed style 而非寫死:DailyScheduleCard 是 scroll-mt-24 (96px)、
// 但 ≤920px 會切成 scroll-mt-20 (80px),寫死任一個值都會在另一個斷點差 16px,
// 而且日後改 class 時這裡不會跟著動。
function getScrollMarginTop(element: Element): number {
  // `|| 0` 只在拿不到 computed style 時生效（元素未接上 document）。
  // 這裡的元素都來自 getElementById，必然已連接，所以實務上走不到；
  // 留一個保守預設而非讓 NaN 汙染後面的對齊判斷。
  return Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
}

// 從探員頁帶 ?date=... 進來時自動捲到當日卡片。
// 班表清單現在會 SSR,首次載入時卡片已在 DOM 裡;但 SPA 導航時 Nuxt router 仍會
// 在導航結束後把頁面捲回頂端,蓋掉我們的捲動,而該次導航的卡片是掛載後才進 DOM。
// 故仍以 rAF 在 3 秒內持續校正:卡片未就位則等待、被 router 歸零則再捲回,
// 連續對齊數幀(router 只歸零一次)後即停止;逾時則安靜放棄。
function scrollToDateWhenReady(iso: string): void {
  const deadline = Date.now() + 3000;
  let stableFrames = 0;
  const tick = (): void => {
    const element = document.getElementById(`schedule-${iso}`);
    if (element) {
      const offset = element.getBoundingClientRect().top - getScrollMarginTop(element);
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
  // ?date= 帶的是 ISO 日期（由探員頁的「當日全體」連結產生）。非 ISO 的值一律忽略，
  // 免得 rAF 迴圈為一個不存在的 id 空轉三秒。
  if (typeof dateQuery === 'string' && isIsoDate(dateQuery)) {
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

    <FilterBar
      v-if="!hasError"
      v-model="selectedAgents"
      :dates="jumpDates"
      @jump="scrollToDate"
    />

    <!-- 載入失敗：與「沒有未來班表」分開呈現，否則 Sheets 掛掉會被誤讀成沒排班 -->
    <EmptyState
      v-if="hasError"
      kanji="無"
      title="無法載入班表"
      subtitle="請稍後再重新整理頁面。"
      data-testid="shifts-error"
    />

    <!-- 班表列表 -->
    <section
      v-else-if="filteredSchedules.length > 0"
      class="flex flex-col gap-6"
      aria-label="班表列表"
    >
      <DailyScheduleCard
        v-for="schedule in filteredSchedules"
        :id="`schedule-${schedule.date.iso}`"
        :key="schedule.date.iso"
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

    <ColorLegend v-if="!hasError && filteredSchedules.length > 0" class="mt-8" />
  </UContainer>
</template>
