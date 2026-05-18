<script setup lang="ts">
interface DateOption {
  label: string;
  value: string;
}

const props = defineProps<{
  dates: DateOption[];
}>();

const emit = defineEmits<{
  jump: [value: string];
}>();

const selectedDate = ref<DateOption | undefined>(undefined);

function handleSelect(item: DateOption) {
  emit('jump', item.value);

  nextTick(() => {
    selectedDate.value = undefined;
  });
}
</script>

<template>
  <div
    v-if="props.dates.length > 0"
    class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
    data-testid="date-jumper"
  >
    <div class="flex items-center gap-2 shrink-0">
      <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-gray-500" />
      <span class="font-medium text-gray-700">跳轉到：</span>
    </div>
    <USelectMenu
      v-model="selectedDate"
      :items="dates"
      :search-input="false"
      placeholder="選擇日期..."
      size="lg"
      class="w-full sm:w-48"
      @update:model-value="handleSelect"
    />
  </div>
</template>
