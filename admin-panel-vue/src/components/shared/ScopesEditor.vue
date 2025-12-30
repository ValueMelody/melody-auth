<script setup lang="ts">
import { computed } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { Scope } from '@/api/types'

interface Props {
  scopes: Scope[]
  selectedScopes: string[]
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:selectedScopes': [value: string[]]
}>()

const selectedSet = computed(() => new Set(props.selectedScopes))

const toggleScope = (scopeName: string) => {
  const newSet = new Set(props.selectedScopes)
  if (newSet.has(scopeName)) {
    newSet.delete(scopeName)
  } else {
    newSet.add(scopeName)
  }
  emit('update:selectedScopes', Array.from(newSet))
}

const isSelected = (scopeName: string) => selectedSet.value.has(scopeName)
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="scope in scopes"
      :key="scope.id"
      class="flex items-center gap-2"
    >
      <Checkbox
        :id="`scope-${scope.id}`"
        :checked="isSelected(scope.name)"
        :disabled="disabled"
        @update:checked="toggleScope(scope.name)"
      />
      <Label
        :for="`scope-${scope.id}`"
        class="cursor-pointer font-normal"
      >
        {{ scope.name }}
        <span v-if="scope.note" class="text-muted-foreground">
          - {{ scope.note }}
        </span>
      </Label>
    </div>
    <p v-if="scopes.length === 0" class="text-sm text-muted-foreground">
      No scopes available
    </p>
  </div>
</template>
