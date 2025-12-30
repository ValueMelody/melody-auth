<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LocaleValue {
  locale: string
  value: string
}

defineProps<{
  modelValue: LocaleValue[]
  label?: string
  note?: string
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: LocaleValue[]]
}>()

const locales = ['en', 'pt', 'fr']

function updateLocale(localeValues: LocaleValue[], locale: string, value: string) {
  const existing = localeValues.find(l => l.locale === locale)
  if (existing) {
    return localeValues.map(l => l.locale === locale ? { ...l, value } : l)
  }
  return [...localeValues, { locale, value }]
}

function getLocaleValue(localeValues: LocaleValue[], locale: string): string {
  return localeValues.find(l => l.locale === locale)?.value || ''
}
</script>

<template>
  <Card>
    <CardHeader v-if="label">
      <CardTitle class="text-base">{{ label }}</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <p v-if="note" class="text-sm text-muted-foreground">{{ note }}</p>
      <div v-for="locale in locales" :key="locale" class="space-y-2">
        <Label :for="'locale-' + locale">{{ locale.toUpperCase() }}</Label>
        <Input
          :id="'locale-' + locale"
          :model-value="getLocaleValue(modelValue, locale)"
          :disabled="disabled"
          @update:model-value="$emit('update:modelValue', updateLocale(modelValue, locale, $event as string))"
        />
      </div>
    </CardContent>
  </Card>
</template>
