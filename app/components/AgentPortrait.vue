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
    class="agent-portrait"
    :to="agentInfo.id ? `/agents/${agentInfo.id}` : undefined"
    :style="ringStyle"
  >
    <span
      class="agent-portrait__photo"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <NuxtImg
        v-if="agentInfo.picture"
        :src="agentInfo.picture"
        :alt="`${agentInfo.displayName} 的照片`"
        class="agent-portrait__img"
        loading="lazy"
      />
      <span v-else class="serif agent-portrait__placeholder" aria-hidden="true">
        {{ agentInfo.displayName.charAt(0) }}
      </span>
      <span v-if="agentInfo.emoji" class="agent-portrait__emoji" aria-hidden="true">
        {{ agentInfo.emoji }}
      </span>
    </span>
    <span class="serif agent-portrait__name">{{ agentInfo.displayName }}</span>
  </component>
</template>

<style scoped>
.agent-portrait {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  transition: transform 0.15s ease;
}
.agent-portrait:hover {
  transform: translateY(-2px);
}

.agent-portrait__photo {
  position: relative;
  border-radius: 50%;
  background: var(--color-paper-2);
  box-shadow:
    0 0 0 1px var(--color-rule),
    0 0 0 4px var(--color-paper),
    0 0 0 5px var(--agent-color, var(--color-rule));
  transition: box-shadow 0.2s ease;
}
.agent-portrait:hover .agent-portrait__photo {
  box-shadow:
    0 0 0 1px var(--color-rule),
    0 0 0 4px var(--color-paper),
    0 0 0 5px var(--agent-color, var(--color-shu));
}

.agent-portrait__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.agent-portrait__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 32px;
  color: var(--color-ink-soft);
  border-radius: 50%;
}

.agent-portrait__emoji {
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: 50%;
}

.agent-portrait__name {
  font-size: 15px;
  line-height: 1.2;
  color: var(--agent-color, var(--color-ink));
}
</style>
