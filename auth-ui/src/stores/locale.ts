import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Locale } from '@/api/types'

const LOCALE_STORAGE_KEY = 'auth-ui-locale'
const SUPPORTED_LOCALES: Locale[] = ['en', 'pt', 'fr']
const DEFAULT_LOCALE: Locale = 'en'

function getStoredLocale(): Locale | null {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
    return stored as Locale
  }
  return null
}

function getBrowserLocale(): Locale {
  const browserLang = navigator.language.split('-')[0]
  if (SUPPORTED_LOCALES.includes(browserLang as Locale)) {
    return browserLang as Locale
  }
  return DEFAULT_LOCALE
}

function getUrlLocale(): Locale | null {
  const urlParams = new URLSearchParams(window.location.search)
  const urlLocale = urlParams.get('locale')
  if (urlLocale && SUPPORTED_LOCALES.includes(urlLocale as Locale)) {
    return urlLocale as Locale
  }
  return null
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>(
    getUrlLocale() || getStoredLocale() || getBrowserLocale()
  )

  watch(locale, (newLocale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
  })

  function setLocale(newLocale: Locale) {
    if (SUPPORTED_LOCALES.includes(newLocale)) {
      locale.value = newLocale
    }
  }

  return {
    locale,
    supportedLocales: SUPPORTED_LOCALES,
    setLocale,
  }
})
