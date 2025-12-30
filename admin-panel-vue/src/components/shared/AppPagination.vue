<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const { t } = useI18n()

const pages = computed(() => {
  const result: (number | 'ellipsis')[] = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  result.push(1)

  if (current > 3) {
    result.push('ellipsis')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    if (!result.includes(i)) result.push(i)
  }

  if (current < total - 2) {
    result.push('ellipsis')
  }

  if (!result.includes(total)) {
    result.push(total)
  }

  return result
})
</script>

<template>
  <nav v-if="totalPages > 1" class="mt-4 flex items-center justify-center gap-1">
    <Button
      variant="ghost"
      size="icon"
      :disabled="currentPage <= 1"
      @click="emit('pageChange', currentPage - 1)"
    >
      <ChevronLeft class="size-4" />
      <span class="sr-only">{{ t('common.previous') }}</span>
    </Button>
    <template v-for="(item, idx) in pages" :key="idx">
      <span v-if="item === 'ellipsis'" class="flex size-9 items-center justify-center">
        <MoreHorizontal class="size-4" />
      </span>
      <Button
        v-else
        variant="ghost"
        size="icon"
        :class="{ 'bg-accent': item === currentPage }"
        @click="emit('pageChange', item)"
      >
        {{ item }}
      </Button>
    </template>
    <Button
      variant="ghost"
      size="icon"
      :disabled="currentPage >= totalPages"
      @click="emit('pageChange', currentPage + 1)"
    >
      <ChevronRight class="size-4" />
      <span class="sr-only">{{ t('common.next') }}</span>
    </Button>
  </nav>
</template>
