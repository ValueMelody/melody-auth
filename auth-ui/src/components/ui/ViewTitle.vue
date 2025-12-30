<script setup lang="ts">
export interface ViewTitleProps {
  title: string
}

defineProps<ViewTitleProps>()
</script>

<template>
  <h1 class="w-[var(--text-width)] text-center text-lg font-bold">
    {{ title }}
  </h1>
</template>
