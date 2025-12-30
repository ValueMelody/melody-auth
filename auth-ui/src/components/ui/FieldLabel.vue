<script setup lang="ts">
export interface FieldLabelProps {
  label: string
  required?: boolean
  fieldName: string
}

withDefaults(defineProps<FieldLabelProps>(), {
  required: false,
})
</script>

<template>
  <label class="font-medium w-[var(--text-width)]" :for="`form-${fieldName}`">
    {{ label }}
    <span
      v-if="required"
      :id="`required-${fieldName}`"
      class="text-[var(--color-criticalIndicatorColor)] ml-2"
    >
      *
    </span>
  </label>
</template>
