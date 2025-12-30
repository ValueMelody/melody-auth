<script setup lang="ts">
import { useLocaleStore } from '@/stores/locale'
import { useI18n } from 'vue-i18n'
import type { Locale } from '@/api/types'

const localeStore = useLocaleStore()
const { locale: i18nLocale } = useI18n()

const localeLabels: Record<Locale, string> = {
  en: 'EN',
  pt: 'PT',
  fr: 'FR',
}

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newLocale = target.value as Locale
  localeStore.setLocale(newLocale)
  i18nLocale.value = newLocale
}
</script>

<template>
  <select
    :value="localeStore.locale"
    class="focus:outline-none cursor-pointer bg-transparent text-sm text-gray-500"
    aria-label="Select Locale"
    @change="handleChange"
  >
    <option
      v-for="supportedLocale in localeStore.supportedLocales"
      :key="supportedLocale"
      :value="supportedLocale"
    >
      {{ localeLabels[supportedLocale] }}
    </option>
  </select>
</template>
