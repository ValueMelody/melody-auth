<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Badge } from '@/components/ui/badge'

defineProps<{
  isActive: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <Badge :variant="isActive ? 'default' : 'secondary'">
    {{ isActive ? t('common.active') : t('common.disabled') }}
  </Badge>
</template>
