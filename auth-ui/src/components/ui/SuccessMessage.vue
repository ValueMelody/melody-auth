<script setup lang="ts">
export interface SuccessMessageProps {
  message: string
}

defineProps<SuccessMessageProps>()
</script>

<template>
  <p class="w-[var(--text-width)] text-green-600 font-semibold text-lg text-center">
    {{ message }}
  </p>
</template>
