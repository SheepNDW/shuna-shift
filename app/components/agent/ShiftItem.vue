<script setup lang="ts">
const props = defineProps<{
  shift: { name: string; textColor: string };
  type: 'day' | 'night';
}>();

// 解析代班/換班資訊
const parseShiftInfo = (name: string, textColor: string) => {
  const isSubstitute = name.includes('(');
  let displayName = name;
  let originalAgent = '';

  if (isSubstitute) {
    const match = name.match(/(.+?)\((.+?)\)/);
    if (match) {
      displayName = match[1]?.trim() || name;
      originalAgent = match[2]?.trim() || '';
    }
  }

  return {
    displayName,
    originalAgent,
    isSubstitute,
    substituteType:
      textColor === '#ef4444' ? 'substitute' : textColor === '#3b82f6' ? 'exchange' : null,
  };
};

const shiftInfo = computed(() => parseShiftInfo(props.shift.name, props.shift.textColor));

const iconConfig = computed(() => {
  if (props.type === 'day') {
    return {
      name: 'i-heroicons-sun',
      color: undefined,
      class: '',
    };
  }

  const nightIconColor = getNightShiftIconColor(props.shift.textColor);
  return {
    name: 'i-heroicons-moon',
    color: nightIconColor || undefined,
    class: nightIconColor ? '' : 'text-gray-900 dark:text-gray-100',
  };
});

const shiftTitle = computed(() => {
  if (props.type === 'day') {
    return '早班 13:30 ~ 17:30';
  }

  const nightTime = getNightShiftTime(props.shift.textColor);
  return `晚班 ${nightTime}`;
});

const titleStyle = computed(() => {
  if (props.type === 'day') {
    return {};
  }

  const nightIconColor = getNightShiftIconColor(props.shift.textColor);
  return nightIconColor ? { color: nightIconColor } : {};
});

const titleClass = computed(() => {
  if (props.type === 'day') {
    return 'text-gray-900 dark:text-gray-100';
  }

  const nightIconColor = getNightShiftIconColor(props.shift.textColor);
  return nightIconColor ? '' : 'text-gray-900 dark:text-gray-100';
});

// 代班/換班圖示
const substituteIcon = computed(() => {
  return shiftInfo.value.substituteType === 'substitute'
    ? 'i-heroicons-arrow-path'
    : 'i-heroicons-arrow-path-rounded-square';
});

// 代班/換班文字
const substituteText = computed(() => {
  return shiftInfo.value.substituteType === 'substitute' ? '代班' : '換班';
});
</script>

<template>
  <div class="flex items-start gap-3">
    <UIcon
      :name="iconConfig.name"
      class="w-5 h-5 shrink-0 mt-0.5"
      :class="iconConfig.class"
      :style="iconConfig.color ? { color: iconConfig.color } : {}"
    />
    <div class="flex-1">
      <p class="font-medium" :class="titleClass" :style="titleStyle">
        {{ shiftTitle }}
      </p>
      <!-- 代班/換班資訊 -->
      <template v-if="shiftInfo.isSubstitute">
        <div class="flex items-center gap-2 mt-1">
          <UIcon :name="substituteIcon" class="w-4 h-4" :style="{ color: shift.textColor }" />
          <span class="text-sm" :style="{ color: shift.textColor }">
            {{ substituteText }}
            <span class="text-gray-600 dark:text-gray-400">
              (原: {{ shiftInfo.originalAgent }})
            </span>
          </span>
        </div>
      </template>
    </div>
  </div>
</template>
