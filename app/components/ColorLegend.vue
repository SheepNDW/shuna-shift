<script setup lang="ts">
// 班表配色圖例(紙感區塊)。掛在 /shifts 底部,說明 AgentChip 文字色承載的
// 晚班時段與紅 / 藍代換班語意 —— 主班表頁的色彩判讀入口。
import { NIGHT_SHIFT_COLOR_MAP, SUBSTITUTE_COLOR_MAP } from '~/utils/colors';

interface LegendEntry {
  /** 色票色碼;留空時以中性墨灰呈現 */
  color: string;
  label: string;
  /** 選填補充說明(時段 / 註記) */
  note?: string;
}

interface LegendGroup {
  kanji: string;
  label: string;
  entries: LegendEntry[];
}

const groups: LegendGroup[] = [
  {
    kanji: '時',
    label: 'SHIFT · 班別時段',
    entries: [
      { color: '', label: '早班', note: '13:30 ~ 17:30' },
      { color: NIGHT_SHIFT_COLOR_MAP.GREEN_SHIFT, label: '晚班', note: '15:00 ~ 19:30' },
      { color: NIGHT_SHIFT_COLOR_MAP.ORANGE_SHIFT, label: '晚班', note: '16:00 ~ 21:30' },
      { color: '', label: '晚班', note: '17:30 ~ 21:30' },
    ],
  },
  {
    kanji: '記',
    label: 'SPECIAL · 特殊標記',
    entries: [
      { color: SUBSTITUTE_COLOR_MAP.SUBSTITUTE, label: '紅字代班', note: '括弧內為原本出勤的探員' },
      { color: SUBSTITUTE_COLOR_MAP.EXCHANGE, label: '藍字換班', note: '括弧內為原本出勤的探員' },
    ],
  },
];
</script>

<template>
  <section class="rounded-lg border border-rule bg-paper-2 p-6" data-testid="color-legend">
    <header class="mb-6 flex items-center gap-4">
      <span
        class="serif flex size-10 items-center justify-center border border-shu text-fs-22 text-shu"
        aria-hidden="true"
      >色</span>
      <div class="flex flex-col">
        <span class="stamp-label">COLOR LEGEND</span>
        <span class="serif text-fs-18 text-ink">班表配色對照</span>
      </div>
    </header>

    <div
      v-for="(group, index) in groups"
      :key="group.label"
      :class="{ 'mt-6 border-t border-rule-2 pt-6': index > 0 }"
    >
      <div class="mb-3 flex items-center gap-2">
        <span class="serif text-fs-16 text-shu" aria-hidden="true">{{ group.kanji }}</span>
        <span class="stamp-label">{{ group.label }}</span>
      </div>
      <ul class="grid gap-x-4 gap-y-2 [grid-template-columns:repeat(auto-fill,minmax(170px,1fr))]">
        <li
          v-for="entry in group.entries"
          :key="`${group.label}-${entry.label}-${entry.note ?? ''}`"
          class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-fs-14 text-ink"
        >
          <span
            class="size-3.5 shrink-0 rounded-sm border border-rule"
            :style="{ backgroundColor: entry.color || 'var(--color-ink-mute)' }"
          />
          <span>{{ entry.label }}</span>
          <span v-if="entry.note" class="text-fs-13 text-ink-mute">· {{ entry.note }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
