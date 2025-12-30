<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

withDefaults(defineProps<{
  disabled?: boolean
  loading?: boolean
}>(), {
  disabled: false,
  loading: false
})

defineEmits<{
  click: []
}>()

const { t } = useI18n()
</script>

<template>
  <Button
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    {{ t('common.save') }}
    <Loader2 v-if="loading" class="ml-2 size-4 animate-spin" />
  </Button>
</template>
