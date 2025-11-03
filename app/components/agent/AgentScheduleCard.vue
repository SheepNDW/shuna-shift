<script setup lang="ts">
import ScheduleDateHeader from './ScheduleDateHeader.vue';
import ShiftItem from './ShiftItem.vue';

defineProps<{
  schedule: AgentScheduleItem;
}>();
</script>

<template>
  <UCard class="hover:shadow-lg transition-shadow">
    <!-- 日期標題 -->
    <ScheduleDateHeader :date="schedule.date" />

    <!-- 班別資訊 -->
    <div class="space-y-4">
      <!-- 早班 -->
      <ShiftItem
        v-for="(shift, shiftIndex) in schedule.dayShifts"
        :key="`day-${shiftIndex}`"
        :shift="shift"
        type="day"
      />

      <!-- 晚班 -->
      <ShiftItem
        v-for="(shift, shiftIndex) in schedule.nightShifts"
        :key="`night-${shiftIndex}`"
        :shift="shift"
        type="night"
      />
    </div>
  </UCard>
</template>
