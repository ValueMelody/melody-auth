import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

const locales = ['en']

export default getRequestConfig(async ({ locale }: { locale:string}) => {
  if (!locales.includes(locale)) notFound()

  return { messages: (await import(`./translations/${locale}.json`)).default }
})
