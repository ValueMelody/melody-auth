import 'app/global.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Metadata } from 'next'
import Setup from 'app/Setup'

export const metadata: Metadata = { title: 'Melody Auth Admin Panel' }

export default async function RootLayout ({
  children, params: { locale },
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <NextIntlClientProvider messages={messages}>
        <body>
          <section className='flex flex-col min-h-screen w-full'>
            <Setup>
              {children}
            </Setup>
          </section>
        </body>
      </NextIntlClientProvider>
    </html>
  )
}
