<script setup lang="ts">
import Spinner from './Spinner.vue'

export interface PrimaryButtonProps {
  title?: string
  type?: 'submit' | 'button'
  isLoading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<PrimaryButtonProps>(), {
  title: '',
  type: 'button',
  isLoading: false,
  disabled: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    class="flex items-center justify-center cursor-pointer p-2 bg-[var(--color-primaryButtonColor)] text-[var(--color-primaryButtonLabelColor)] border border-[var(--color-primaryButtonBorderColor)] rounded-lg font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
    :type="type"
    :disabled="disabled || isLoading"
    @click="$emit('click', $event)"
  >
    <slot>{{ title }}</slot>
    <span v-if="isLoading" class="ml-2">
      <Spinner />
    </span>
  </button>
</template>
