<script setup lang="ts">
import { Badge } from '@/components/ui/badge'

defineProps<{
  type: 'spa' | 's2s'
}>()
</script>

<template>
  <Badge :variant="type === 'spa' ? 'default' : 'secondary'">
    {{ type.toUpperCase() }}
  </Badge>
</template>
