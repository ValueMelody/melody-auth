<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loader2, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Props {
  disabled?: boolean
  loading?: boolean
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  loading: false
})
defineEmits<{
  confirm: []
}>()

const { t } = useI18n()
const open = ref(false)
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogTrigger as-child>
      <Button
        variant="destructive"
        :disabled="disabled || loading"
      >
        <Loader2 v-if="loading" class="size-4 animate-spin" />
        <Trash2 v-else class="size-4" />
        {{ t('common.delete') }}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {{ title || t('common.delete') }}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {{ description || t('common.deleteConfirm', { item: '' }) }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>
          {{ t('common.cancel') }}
        </AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-white hover:bg-destructive/90"
          @click="$emit('confirm'); open = false"
        >
          {{ t('common.deleteConfirmBtn') }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
