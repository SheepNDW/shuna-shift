<script setup lang="ts">
import ScheduleDateHeader from './ScheduleDateHeader.vue';

defineProps<{
  schedule: AgentScheduleItem;
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
</script>

<template>
  <UCard class="hover:shadow-lg transition-shadow">
    <!-- 日期標題 -->
    <ScheduleDateHeader :date="schedule.date" />

    <!-- 班別資訊 -->
    <div class="space-y-4">
      <!-- 早班 -->
      <div
        v-for="(shift, shiftIndex) in schedule.dayShifts"
        :key="`day-${shiftIndex}`"
        class="flex items-start gap-3"
      >
        <UIcon name="i-heroicons-sun" class="w-5 h-5 shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="font-medium text-gray-900 dark:text-gray-100">早班 13:30 ~ 17:30</p>
          <!-- 代班/換班資訊 -->
          <template v-if="parseShiftInfo(shift.name, shift.textColor).isSubstitute">
            <div class="flex items-center gap-2 mt-1">
              <UIcon
                :name="
                  parseShiftInfo(shift.name, shift.textColor).substituteType === 'substitute'
                    ? 'i-heroicons-arrow-path'
                    : 'i-heroicons-arrow-path-rounded-square'
                "
                class="w-4 h-4"
                :style="{ color: shift.textColor }"
              />
              <span class="text-sm" :style="{ color: shift.textColor }">
                {{
                  parseShiftInfo(shift.name, shift.textColor).substituteType === 'substitute'
                    ? '代班'
                    : '換班'
                }}
                <span class="text-gray-600 dark:text-gray-400">
                  (原:
                  {{ parseShiftInfo(shift.name, shift.textColor).originalAgent }})
                </span>
              </span>
            </div>
          </template>
        </div>
      </div>

      <!-- 晚班 -->
      <div
        v-for="(shift, shiftIndex) in schedule.nightShifts"
        :key="`night-${shiftIndex}`"
        class="flex items-start gap-3"
      >
        <UIcon
          name="i-heroicons-moon"
          class="w-5 h-5 shrink-0 mt-0.5"
          :class="getNightShiftIconColor(shift.textColor) ? '' : 'text-gray-900 dark:text-gray-100'"
          :style="
            getNightShiftIconColor(shift.textColor)
              ? { color: getNightShiftIconColor(shift.textColor) }
              : {}
          "
        />
        <div class="flex-1">
          <p
            class="font-medium"
            :class="
              getNightShiftIconColor(shift.textColor) ? '' : 'text-gray-900 dark:text-gray-100'
            "
            :style="
              getNightShiftIconColor(shift.textColor)
                ? { color: getNightShiftIconColor(shift.textColor) }
                : {}
            "
          >
            晚班 {{ getNightShiftTime(shift.textColor) }}
          </p>
          <!-- 代班/換班資訊 -->
          <template v-if="parseShiftInfo(shift.name, shift.textColor).isSubstitute">
            <div class="flex items-center gap-2 mt-1">
              <UIcon
                :name="
                  parseShiftInfo(shift.name, shift.textColor).substituteType === 'substitute'
                    ? 'i-heroicons-arrow-path'
                    : 'i-heroicons-arrow-path-rounded-square'
                "
                class="w-4 h-4"
                :style="{ color: shift.textColor }"
              />
              <span class="text-sm" :style="{ color: shift.textColor }">
                {{
                  parseShiftInfo(shift.name, shift.textColor).substituteType === 'substitute'
                    ? '代班'
                    : '換班'
                }}
                <span class="text-gray-600 dark:text-gray-400">
                  (原:
                  {{ parseShiftInfo(shift.name, shift.textColor).originalAgent }})
                </span>
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </UCard>
</template>
