<script setup lang="ts">
// 統計頁摘要格：左側漢字圖章 + 右側 stamp-label / 說明 / 數值 / 選填 subValue。
// 四種 accent 對應四個 token 色系（早班 / 晚班 / 朱 / 墨），漢字框依 accent 換色。
type Accent = 'day' | 'night' | 'shu' | 'ink';

const {
  kanji,
  label,
  desc,
  value,
  accent,
  subValue = '',
} = defineProps<{
  /** 漢字圖章（單字），如「日」「夜」「總」「冠」 */
  kanji: string;
  /** romaji / 分類小標，如「DAY SHIFTS」 */
  label: string;
  /** 一句話說明，如「早班總次數」或 MVP 探員名字 */
  desc: string;
  /** 主要數值（會補零至兩位） */
  value: number;
  /** 色彩語意：day=早班 amber、night=晚班 indigo、shu=品牌朱、ink=深墨 */
  accent: Accent;
  /** 選填補充行（MVP 格用來顯示日 / 夜拆分） */
  subValue?: string;
}>();

// 漢字框的 accent 配色：文字 / 邊框 / 底色三件組
const accentClass: Record<Accent, string> = {
  day: 'text-day-deep border-day bg-day-soft',
  night: 'text-night-deep border-night bg-night-soft',
  shu: 'text-shu border-shu bg-shu-soft',
  ink: 'text-paper border-ink bg-ink',
};

const displayValue = computed(() => padZero(value));
</script>

<template>
  <div
    class="flex items-stretch gap-4 rounded-lg border border-rule bg-surface p-5"
    data-testid="summary-tile"
  >
    <span
      class="serif flex w-14 shrink-0 items-center justify-center rounded-sm border text-[42px] leading-none"
      :class="accentClass[accent]"
      aria-hidden="true"
    >{{ kanji }}</span>

    <div class="flex min-w-0 flex-col justify-between gap-1">
      <span class="stamp-label">{{ label }}</span>
      <span class="truncate text-fs-13 text-ink-soft" data-testid="summary-tile-desc">
        {{ desc }}
      </span>
      <span
        class="mono tnum mt-1 text-fs-36 text-ink"
        data-testid="summary-tile-value"
      >{{ displayValue }}</span>
      <span
        v-if="subValue"
        class="stamp-label tnum mt-0.5 text-ink-mute"
        data-testid="summary-tile-sub"
      >{{ subValue }}</span>
    </div>
  </div>
</template>
