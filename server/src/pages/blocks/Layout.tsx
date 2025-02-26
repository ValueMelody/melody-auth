import { ReactNode } from 'hono/jsx'
import {
  localeConfig, typeConfig,
} from 'configs'
import { LocaleSelector } from 'pages/components'

const Layout = ({
  children, locale, locales, logoUrl,
  onSwitchLocale,
}: { logoUrl: string;
  children: ReactNode; locale: typeConfig.Locale; locales: typeConfig.Locale[];
  onSwitchLocale: (locale: typeConfig.Locale) => void;
}) => (
  <main className='flex flex-col items-center justify-center w-full h-screen bg-layoutColor text-labelColor'>
    <section className='flex flex-col justify-center items-center p-8 bg-white box-shadow rounded-lg'>
      <section className='flex flex-col items-center gap-4 max-h-[80vh] overflow-y-auto overflow-x-hidden'>
        <header className='relative flex w-full justify-center items-center'>
          <img
            className='w-10'
            src={logoUrl}
            alt='Logo'
          />
          {locales.length > 1 && (
            <div className='absolute right-0'>
              <LocaleSelector
                locale={locale}
                locales={locales}
                onChange={onSwitchLocale}
              />
            </div>
          )}
        </header>
        {children}
        <a
          target='__blank'
          href='https://github.com/ValueMelody/melody-auth'
          className='text-sm mt-2'
        >
          {localeConfig.common.poweredByAuth[locale]}
        </a>
      </section>
    </section>
  </main>
)

export default Layout
