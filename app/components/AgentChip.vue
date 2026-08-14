<script setup lang="ts">
// 排班列表中代表單一探員的 pill：文字色圓點 + 名字 + emoji。
// textColor 來自班表，承載晚班時段 / 紅字代班 / 藍字換班語意；空字串時退回中性色。
// 樣式沿用 components.css 的 .agent-chip（含動態 --agent-color）。
// NuxtLink 直接從 #components import：字串 'NuxtLink' 在 runtime 無法被
// resolveDynamicComponent 解析（會渲染成無作用的 <nuxtlink> 元素）。
import { NuxtLink } from '#components';
import { AGENTS } from '~~/shared/constant';
import { parseAgentCell } from '~~/shared/utils/agent-name';

const {
  name,
  textColor = '',
  highlighted = false,
} = defineProps<{
  /** 班表中的探員名稱（可能為 emoji、別名或帶括號替班記錄） */
  name: string;
  /** 班表給定的文字色；空字串時圓點與名字退回中性色 */
  textColor?: string;
  /** 是否為篩選高亮的探員 */
  highlighted?: boolean;
}>();

const agentInfo = computed(() => {
  // 帶括號註記（代班 `小楓(泠泠)`、時段 `亞米(~18:00)`）以當班者查表，
  // 顯示維持原字串——括號內容是使用者需要看見的當日異動
  const { name: onDutyName, note } = parseAgentCell(name);
  const info = AGENTS.get(onDutyName);

  return {
    id: info?.id ?? '',
    displayName: note ? name : info?.name ?? name,
    emoji: info?.emoji ?? '',
  };
});

// 僅在有文字色時設定 --agent-color，否則交由 components.css 的 fallback
const colorStyle = computed(() => (textColor ? { '--agent-color': textColor } : {}));
</script>

<template>
  <component
    :is="agentInfo.id ? NuxtLink : 'span'"
    class="agent-chip"
    :class="{ 'is-highlighted': highlighted, 'cursor-auto': !agentInfo.id }"
    :to="agentInfo.id ? `/agents/${agentInfo.id}` : undefined"
    :style="colorStyle"
    data-testid="agent-chip"
    :data-highlighted="highlighted"
  >
    <span class="agent-chip__dot" aria-hidden="true" />
    <span class="agent-chip__name" data-testid="agent-chip-name">
      {{ agentInfo.displayName }}
    </span>
    <span
      v-if="agentInfo.emoji"
      class="text-[13px] opacity-90"
      aria-hidden="true"
    >{{ agentInfo.emoji }}</span>
  </component>
</template>
