<script setup lang="ts">
import type { CSSProperties } from 'vue'

export interface FieldInputProps {
  type?: 'email' | 'text' | 'password'
  name: string
  autoComplete?: string
  modelValue?: string
  disabled?: boolean
  inputStyle?: CSSProperties
}

withDefaults(defineProps<FieldInputProps>(), {
  type: 'text',
  autoComplete: undefined,
  modelValue: '',
  disabled: false,
  inputStyle: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <input
    :id="`form-${name}`"
    class="bg-white border border-[lightGray] rounded-lg p-3 w-[var(--text-width)]"
    :type="type"
    :style="inputStyle"
    :name="name"
    :autocomplete="autoComplete"
    :value="modelValue"
    :disabled="disabled"
    @input="handleInput"
  />
</template>
