<script setup lang="ts">
export interface SubmitErrorProps {
  error?: string | null
}

defineProps<SubmitErrorProps>()
</script>

<template>
  <p
    v-if="error"
    class="break-words mt-4 bg-[var(--color-criticalIndicatorColor)] text-white rounded-md py-2 px-4 w-[var(--text-width)] self-center box-border"
  >
    {{ error }}
  </p>
</template>
