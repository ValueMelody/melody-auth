<script setup lang="ts">
import { computed } from 'vue'

export interface CheckboxInputProps {
  id?: string
  label: string
  modelValue: boolean
}

const props = withDefaults(defineProps<CheckboxInputProps>(), {
  id: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const inputId = computed(() => props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`)

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<template>
  <section class="flex max-w-[var(--text-width)]">
    <input
      :id="inputId"
      type="checkbox"
      :checked="modelValue"
      :aria-label="label"
      class="mr-2"
      @change="handleChange"
    />
    <label :for="inputId">
      {{ label }}
    </label>
  </section>
</template>
