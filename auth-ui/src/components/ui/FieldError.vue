<script setup lang="ts">
export interface FieldErrorProps {
  error?: string
}

defineProps<FieldErrorProps>()
</script>

<template>
  <p
    v-if="error"
    class="text-[var(--color-criticalIndicatorColor)] text-sm w-[var(--text-width)]"
  >
    {{ error }}
  </p>
</template>
