<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  title: string
  class?: string
}>()
</script>

<template>
  <h1 :class="cn('text-2xl font-bold tracking-tight mb-6', $props.class)">
    {{ title }}
  </h1>
</template>
