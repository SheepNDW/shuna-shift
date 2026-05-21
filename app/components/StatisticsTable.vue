<script setup lang="ts">
// 出勤排行表（prototype 的 stat-table）：排名 + 探員 + stacked bar + 日 / 夜 / 總。
// statistics 已由 server 端 calculateAgentStatistics 依總班次降序排列，
// 此處直接以陣列順序作為固定排名，不再提供互動排序（排名語意需要固定順序）。
import type { AgentStatistics } from '~~/shared/types';

const { statistics } = defineProps<{
  statistics: AgentStatistics[];
}>();

// stacked bar 的滿格基準：以排行中的最高總班次計算
const maxTotal = computed(() =>
  statistics.reduce((max, stat) => Math.max(max, stat.total), 0),
);

/** 兩位數補零，供排名與班次數字使用 */
function pad2(value: number): string {
  return String(value).padStart(2, '0');
}
</script>

<template>
  <section
    class="overflow-hidden rounded-lg border border-rule bg-surface"
    data-testid="statistics-table"
  >
    <!-- 表頭：標題 + 早 / 晚班圖例 -->
    <div
      class="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-6 py-5 max-[520px]:px-4"
    >
      <h2 class="serif text-fs-22 text-ink">探員出勤排行</h2>
      <div class="flex gap-4">
        <span class="inline-flex items-center gap-1.5 text-fs-13 text-ink-soft">
          <span class="h-3 w-3 rounded-[2px] bg-day" aria-hidden="true" />早班
        </span>
        <span class="inline-flex items-center gap-1.5 text-fs-13 text-ink-soft">
          <span class="h-3 w-3 rounded-[2px] bg-night" aria-hidden="true" />晚班
        </span>
      </div>
    </div>

    <!-- 窄螢幕欄位較多時改水平捲動，避免欄位被 section 的 overflow 裁切 -->
    <div v-if="statistics.length > 0" class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-rule bg-paper-2">
            <th
              class="stamp-label w-[1%] whitespace-nowrap px-6 py-3.5 text-left font-normal max-[520px]:px-3 max-[520px]:py-2.5"
            >
              #
            </th>
            <th
              class="stamp-label w-[1%] whitespace-nowrap px-6 py-3.5 text-left font-normal max-[520px]:px-3 max-[520px]:py-2.5"
            >
              探員
            </th>
            <th
              class="stamp-label whitespace-nowrap px-6 py-3.5 text-left font-normal max-[520px]:px-3 max-[520px]:py-2.5"
            >
              分佈<span class="max-[520px]:hidden"> · DISTRIBUTION</span>
            </th>
            <th
              class="stamp-label w-[1%] whitespace-nowrap px-6 py-3.5 text-left font-normal max-[520px]:px-3 max-[520px]:py-2.5"
            >
              日
            </th>
            <th
              class="stamp-label w-[1%] whitespace-nowrap px-6 py-3.5 text-left font-normal max-[520px]:px-3 max-[520px]:py-2.5"
            >
              夜
            </th>
            <th
              class="stamp-label w-[1%] whitespace-nowrap px-6 py-3.5 text-left font-normal max-[520px]:px-3 max-[520px]:py-2.5"
            >
              總
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(stat, index) in statistics"
            :key="stat.agentId"
            class="border-b border-rule-2 transition-colors last:border-b-0 hover:bg-shu-50"
            data-testid="statistics-table-row"
          >
            <td
              class="mono tnum px-6 py-3.5 align-middle text-fs-13 text-ink-mute max-[520px]:px-3 max-[520px]:py-2.5"
            >
              {{ pad2(index + 1) }}
            </td>
            <td class="px-6 py-3.5 align-middle max-[520px]:px-3 max-[520px]:py-2.5">
              <NuxtLink
                :to="`/agents/${stat.agentId}`"
                class="group inline-flex items-center gap-2 whitespace-nowrap"
                data-testid="statistics-table-link"
              >
                <span
                  class="h-2.5 w-2.5 shrink-0 rounded-full bg-shu"
                  aria-hidden="true"
                />
                <span
                  class="serif text-fs-16 text-ink transition-colors group-hover:text-shu"
                  data-testid="statistics-table-name"
                >{{ stat.name }}</span>
                <span
                  v-if="stat.isFullTime"
                  class="inline-flex items-center rounded-sm border border-shu px-1.5 py-px text-[10px] tracking-stamp text-shu"
                  data-testid="statistics-table-full"
                >FULL</span>
              </NuxtLink>
            </td>
            <td
              class="px-6 py-3.5 align-middle max-[520px]:px-3 max-[520px]:py-2.5"
            >
              <StatBar
                :day-count="stat.dayCount"
                :night-count="stat.nightCount"
                :max-total="maxTotal"
              />
            </td>
            <td
              class="mono tnum px-6 py-3.5 align-middle text-fs-14 text-ink-soft max-[520px]:px-3 max-[520px]:py-2.5"
            >
              {{ pad2(stat.dayCount) }}
            </td>
            <td
              class="mono tnum px-6 py-3.5 align-middle text-fs-14 text-ink-soft max-[520px]:px-3 max-[520px]:py-2.5"
            >
              {{ pad2(stat.nightCount) }}
            </td>
            <td
              class="mono tnum px-6 py-3.5 align-middle text-fs-14 font-medium text-ink max-[520px]:px-3 max-[520px]:py-2.5"
            >
              {{ pad2(stat.total) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空狀態 -->
    <div v-else class="px-6 py-16 text-center" data-testid="statistics-table-empty">
      <p class="serif text-fs-18 text-ink-soft">沒有統計資料</p>
    </div>
  </section>
</template>
