import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import pt from './locales/pt.json'
import fr from './locales/fr.json'

export type MessageSchema = typeof en

const i18n = createI18n<[MessageSchema], 'en' | 'pt' | 'fr'>({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    pt,
    fr,
  },
})

export default i18n
