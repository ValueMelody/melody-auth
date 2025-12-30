<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

defineProps<{
  modelValue: 'spa' | 's2s'
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: 'spa' | 's2s']
}>()
</script>

<template>
  <Select
    :model-value="modelValue"
    :disabled="disabled"
    @update:model-value="$emit('update:modelValue', $event as 'spa' | 's2s')"
  >
    <SelectTrigger class="w-full">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="spa">SPA</SelectItem>
      <SelectItem value="s2s">S2S</SelectItem>
    </SelectContent>
  </Select>
</template>
