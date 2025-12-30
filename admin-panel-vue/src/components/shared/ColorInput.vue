<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  modelValue: string
  label?: string
  id?: string
  disabled?: boolean
}

const props = defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = props.id || `color-${(props.label || 'color').toLowerCase().replace(/\s+/g, '-')}`
</script>

<template>
  <div class="space-y-1">
    <Label v-if="label" :for="inputId">{{ label }}</Label>
    <div class="flex items-center gap-2">
      <input
        :id="`${inputId}-picker`"
        type="color"
        :value="modelValue"
        :disabled="disabled"
        class="h-9 w-12 cursor-pointer rounded border border-input bg-transparent p-1"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <Input
        :id="inputId"
        :model-value="modelValue"
        :disabled="disabled"
        placeholder="#000000"
        class="flex-1"
        @update:model-value="$emit('update:modelValue', String($event))"
      />
    </div>
  </div>
</template>
