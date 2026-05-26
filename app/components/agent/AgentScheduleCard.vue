<script setup lang="ts">
// 探員詳情頁的單列排班:三欄式 schedule-row(日期 / 早晚 badge / 當日全體連結)。
// 取代舊版 UCard + ShiftItem 嵌套,以表格化呈現探員的近期排班。
//
// 樣式策略:layout / 間距 / 字級走 Tailwind utility;早 / 晚 badge 沿用
// components.css 的 .shift-icon-day / .shift-icon-night class(currentColor)。
//
// badge 渲染策略(2026-05 review 修正):per-shift 而非單一 boolean。
// 晚班時段以 textColor 還原(綠 15:00–19:30 / 橘 16:00–21:30 / 預設 17:30–21:30),
// textColor 為 #ff0000 / #1155cc 時額外標出「代班 / 換班」與原班探員名字,
// 對齊舊 ShiftItem 的語意,避免使用者看不出該日是代班或不同時段晚班。
import type { AgentScheduleItem } from '~~/app/composables/useAgent';
import {
  getNightShiftIconColor,
  getNightShiftTime,
  isLeaveColor,
  SUBSTITUTE_COLOR_MAP,
} from '~~/app/utils/colors';

const SUBSTITUTE_COLOR = SUBSTITUTE_COLOR_MAP.SUBSTITUTE;
const EXCHANGE_COLOR = SUBSTITUTE_COLOR_MAP.EXCHANGE;

interface ShiftMeta {
  iconColor: string;
  time: string;
  hasBracket: boolean;
  displayName: string;
  originalAgent: string;
  substituteType: 'substitute' | 'exchange' | null;
  /** 灰字＝原排班但當天臨時不出勤；badge 走中性灰並加上「今日不出勤」小標 */
  isLeave: boolean;
}

function parseShift(
  shift: { name: string; textColor: string },
  type: 'day' | 'night'
): ShiftMeta {
  const hasBracket = shift.name.includes('(');
  let displayName = shift.name;
  let originalAgent = '';
  if (hasBracket) {
    const match = shift.name.match(/(.+?)\((.+?)\)/);
    if (match) {
      displayName = match[1]?.trim() || shift.name;
      originalAgent = match[2]?.trim() || '';
    }
  }

  const substituteType: ShiftMeta['substituteType'] =
    shift.textColor === SUBSTITUTE_COLOR
      ? 'substitute'
      : shift.textColor === EXCHANGE_COLOR
        ? 'exchange'
        : null;

  const isLeave = isLeaveColor(shift.textColor);

  if (type === 'day') {
    return {
      iconColor: '',
      time: '13:30 ~ 17:30',
      hasBracket,
      displayName,
      originalAgent,
      substituteType,
      isLeave,
    };
  }

  // 灰字暫離時 textColor 已非綠/橘，故時段退回預設且不套色（無從還原原時段）
  return {
    iconColor: isLeave ? '' : getNightShiftIconColor(shift.textColor),
    time: getNightShiftTime(shift.textColor),
    hasBracket,
    displayName,
    originalAgent,
    substituteType,
    isLeave,
  };
}

const { schedule } = defineProps<{
  schedule: AgentScheduleItem;
}>();

const today = computed(() => isToday(schedule.date.datetime));
const parsed = computed(() => parseDateLabel(schedule.date.datetime));
const weekday = computed(() => getWeekdayLabel(schedule.date.datetime));

const dayShiftMetas = computed(() =>
  schedule.dayShifts.map((shift) => parseShift(shift, 'day'))
);
const nightShiftMetas = computed(() =>
  schedule.nightShifts.map((shift) => parseShift(shift, 'night'))
);
</script>

<template>
  <li
    class="grid items-center gap-4 border-b border-rule-2 px-5 py-4 last:border-b-0 max-[920px]:grid-cols-1 max-[920px]:gap-2 sm:grid-cols-[220px_1fr_auto] sm:gap-5"
    :class="{ 'bg-shu-soft': today }"
    data-testid="agent-schedule-row"
    :data-today="today"
  >
    <div class="flex items-center gap-2.5">
      <span
        class="mono tnum text-fs-18 text-ink"
        data-testid="agent-schedule-date"
      >{{ schedule.date.datetime }}</span>
      <span
        v-if="parsed"
        class="serif text-fs-15 text-ink-soft"
        data-testid="agent-schedule-weekday"
      >星期{{ weekday }}</span>
      <span
        v-if="today"
        class="stamp-label text-shu"
        data-testid="agent-schedule-today"
      >TODAY</span>
    </div>

    <div class="flex flex-col gap-1.5" data-testid="agent-schedule-badges">
      <div
        v-for="(meta, i) in dayShiftMetas"
        :key="`d-${i}`"
        class="flex flex-wrap items-center gap-2"
      >
        <span
          :class="[
            meta.isLeave ? 'shift-icon-leave' : 'shift-icon-day',
            'inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-fs-13',
          ]"
          data-testid="agent-schedule-badge-day"
          :data-leave="meta.isLeave"
        >
          <span class="block h-3.5 w-3.5">
            <ShiftGlyph type="day" />
          </span>
          早班 {{ meta.time }}
        </span>
        <span
          v-if="meta.isLeave"
          class="inline-flex items-center gap-1 text-fs-12 text-ink-mute"
          data-testid="agent-schedule-leave-day"
        >
          <span aria-hidden="true">✕</span>
          今日不出勤
        </span>
        <span
          v-else-if="meta.substituteType"
          class="inline-flex items-center gap-1 text-fs-12"
          :style="{ color: meta.substituteType === 'substitute' ? SUBSTITUTE_COLOR : EXCHANGE_COLOR }"
          :data-substitute-type="meta.substituteType"
          data-testid="agent-schedule-substitute"
        >
          <span aria-hidden="true">{{ meta.substituteType === 'substitute' ? '↻' : '⇄' }}</span>
          {{ meta.substituteType === 'substitute' ? '代班' : '換班' }}
          <span v-if="meta.originalAgent" class="text-ink-mute">(原: {{ meta.originalAgent }})</span>
        </span>
      </div>
      <div
        v-for="(meta, i) in nightShiftMetas"
        :key="`n-${i}`"
        class="flex flex-wrap items-center gap-2"
      >
        <span
          :class="[
            meta.isLeave ? 'shift-icon-leave' : 'shift-icon-night',
            'inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-fs-13',
          ]"
          :style="!meta.isLeave && meta.iconColor ? { color: meta.iconColor } : undefined"
          data-testid="agent-schedule-badge-night"
          :data-leave="meta.isLeave"
        >
          <span class="block h-3.5 w-3.5">
            <ShiftGlyph type="night" />
          </span>
          晚班 {{ meta.time }}
        </span>
        <span
          v-if="meta.isLeave"
          class="inline-flex items-center gap-1 text-fs-12 text-ink-mute"
          data-testid="agent-schedule-leave-night"
        >
          <span aria-hidden="true">✕</span>
          今日不出勤
        </span>
        <span
          v-else-if="meta.substituteType"
          class="inline-flex items-center gap-1 text-fs-12"
          :style="{ color: meta.substituteType === 'substitute' ? SUBSTITUTE_COLOR : EXCHANGE_COLOR }"
          :data-substitute-type="meta.substituteType"
          data-testid="agent-schedule-substitute"
        >
          <span aria-hidden="true">{{ meta.substituteType === 'substitute' ? '↻' : '⇄' }}</span>
          {{ meta.substituteType === 'substitute' ? '代班' : '換班' }}
          <span v-if="meta.originalAgent" class="text-ink-mute">(原: {{ meta.originalAgent }})</span>
        </span>
      </div>
    </div>

    <NuxtLink
      :to="`/shifts?date=${schedule.date.datetime}`"
      class="text-fs-13 text-ink-soft transition-colors hover:text-shu"
      data-testid="agent-schedule-link"
    >當日全體 →</NuxtLink>
  </li>
</template>
