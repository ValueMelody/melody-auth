import 'app/global.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Metadata } from 'next'
import Setup from 'app/Setup'

export const metadata: Metadata = { title: 'Melody Auth Admin Panel' }

export default async function RootLayout ({
  children, params,
}: {
  children: React.ReactNode;
  params: Promise<{lang: string}>;
}) {
  const { lang } = await params
  const messages = await getMessages()

  return (
    <html lang={lang}>
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
