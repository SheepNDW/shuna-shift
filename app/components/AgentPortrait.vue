<script setup lang="ts">
// 圓形探員頭像 + 代表色 ring，用於首頁今日早 / 晚班。
// 代表色透過 --agent-color CSS 變數傳入，ring / 名字皆引用同一變數。
import { AGENTS } from '~~/shared/constant';

const {
  name,
  textColor = '',
  size = 88,
} = defineProps<{
  /** 班表中的探員名稱（可能為 emoji、別名或帶括號替班記錄） */
  name: string;
  /** 班表給定的代表色；空字串時 ring 退回中性髮絲線色 */
  textColor?: string;
  /** 頭像直徑（px） */
  size?: number;
}>();

const agentInfo = computed(() => {
  // 帶括號的替班記錄（小楓(泠泠)）以括號前段查表，顯示維持原字串
  const searchName = name.includes('(') ? name.split('(')[0]?.trim() || name : name;
  const info = AGENTS.get(searchName);

  return {
    id: info?.id ?? '',
    displayName: name.includes('(') ? name : info?.name ?? name,
    picture: info?.picture ?? '',
    emoji: info?.emoji ?? '',
  };
});

// 僅在有代表色時設定 --agent-color，否則交由 CSS fallback
const ringStyle = computed(() => (textColor ? { '--agent-color': textColor } : {}));
</script>

<template>
  <component
    :is="agentInfo.id ? 'NuxtLink' : 'div'"
    class="agent-portrait flex flex-col items-center gap-2 text-center transition-transform duration-150 motion-safe:hover:-translate-y-0.5"
    :to="agentInfo.id ? `/agents/${agentInfo.id}` : undefined"
    :style="ringStyle"
    data-testid="agent-portrait"
  >
    <span
      class="agent-portrait__photo relative rounded-full bg-paper-2 transition-shadow duration-200"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <NuxtImg
        v-if="agentInfo.picture"
        :src="agentInfo.picture"
        :alt="`${agentInfo.displayName} 的照片`"
        class="block h-full w-full rounded-full object-cover"
        loading="lazy"
      />
      <span
        v-else
        class="serif flex h-full w-full items-center justify-center rounded-full text-fs-28 text-ink-soft"
        aria-hidden="true"
      >
        {{ agentInfo.displayName.charAt(0) }}
      </span>
      <span
        v-if="agentInfo.emoji"
        class="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-rule bg-paper text-fs-15"
        aria-hidden="true"
        data-testid="agent-emoji"
      >
        {{ agentInfo.emoji }}
      </span>
    </span>
    <span
      class="agent-portrait__name serif text-fs-15 leading-tight"
      data-testid="agent-name"
    >
      {{ agentInfo.displayName }}
    </span>
  </component>
</template>

<style scoped>
/* 探員代表色 ring 與名字色：帶 --agent-color 變數的多層 box-shadow，utility 無法表達 */
.agent-portrait__photo {
  box-shadow:
    0 0 0 1px var(--color-rule),
    0 0 0 4px var(--color-paper),
    0 0 0 5px var(--agent-color, var(--color-rule));
}
.agent-portrait:hover .agent-portrait__photo {
  box-shadow:
    0 0 0 1px var(--color-rule),
    0 0 0 4px var(--color-paper),
    0 0 0 5px var(--agent-color, var(--color-shu));
}
.agent-portrait__name {
  color: var(--agent-color, var(--color-ink));
}
</style>
