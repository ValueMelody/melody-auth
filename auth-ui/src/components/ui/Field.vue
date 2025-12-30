<script setup lang="ts">
import FieldLabel from './FieldLabel.vue'
import FieldError from './FieldError.vue'
import FieldInput from './FieldInput.vue'

export interface FieldProps {
  label: string
  required?: boolean
  type?: 'email' | 'text' | 'password'
  name: string
  autoComplete?: string
  modelValue?: string
  disabled?: boolean
  error?: string
}

withDefaults(defineProps<FieldProps>(), {
  required: false,
  type: 'text',
  autoComplete: undefined,
  modelValue: '',
  disabled: false,
  error: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleUpdate = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <section class="flex flex-col gap-2">
    <FieldLabel :label="label" :required="required" :field-name="name" />
    <FieldInput
      :type="type"
      :name="name"
      :auto-complete="autoComplete"
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="handleUpdate"
    />
    <FieldError :error="error" />
  </section>
</template>
