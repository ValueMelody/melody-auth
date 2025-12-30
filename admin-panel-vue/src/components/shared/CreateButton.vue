<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

defineProps<{
  to: string
  label: string
}>()

const { t } = useI18n()
</script>

<template>
  <Button as-child>
    <router-link :to="to" class="flex items-center gap-2">
      <Plus class="size-4" />
      {{ t(label) }}
    </router-link>
  </Button>
</template>
