<script setup lang="ts">
import Spinner from './Spinner.vue'

export interface SecondaryButtonProps {
  title?: string
  isLoading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<SecondaryButtonProps>(), {
  title: '',
  isLoading: false,
  disabled: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-center cursor-pointer text-base font-medium rounded-lg text-center border border-[var(--color-secondaryButtonBorderColor)] text-[var(--color-secondaryButtonLabelColor)] bg-[var(--color-secondaryButtonColor)] p-2 disabled:opacity-50 disabled:cursor-not-allowed"
    :disabled="disabled || isLoading"
    @click="$emit('click', $event)"
  >
    <slot>{{ title }}</slot>
    <span v-if="isLoading" class="ml-2">
      <Spinner />
    </span>
  </button>
</template>
