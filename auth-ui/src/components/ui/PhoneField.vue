<script setup lang="ts">
import { computed } from 'vue'
import FieldLabel from './FieldLabel.vue'
import FieldError from './FieldError.vue'
import FieldInput from './FieldInput.vue'

export interface PhoneFieldProps {
  label: string
  required?: boolean
  name: string
  modelValue?: string
  disabled?: boolean
  error?: string
  countryCode?: string
}

const props = withDefaults(defineProps<PhoneFieldProps>(), {
  required: false,
  modelValue: '',
  disabled: false,
  error: undefined,
  countryCode: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputStyle = computed(() => {
  if (props.countryCode) {
    return { paddingLeft: `${25 + props.countryCode.length * 5}px` }
  }
  return undefined
})

const handleUpdate = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <section class="flex flex-col gap-2">
    <FieldLabel :label="label" :required="required" :field-name="name" />
    <div class="flex items-center relative">
      <FieldInput
        type="text"
        :name="name"
        :model-value="modelValue"
        :disabled="disabled"
        :input-style="inputStyle"
        @update:model-value="handleUpdate"
      />
      <p v-if="countryCode" class="absolute ml-[10px] text-sm">
        {{ countryCode }}
      </p>
    </div>
    <FieldError :error="error" />
  </section>
</template>
