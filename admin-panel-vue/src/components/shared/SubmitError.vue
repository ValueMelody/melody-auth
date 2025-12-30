<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  error?: string
}

defineProps<Props>()
</script>

<template>
  <Alert v-if="error" variant="destructive">
    <AlertCircle class="size-4" />
    <AlertDescription>
      {{ error }}
    </AlertDescription>
  </Alert>
</template>
