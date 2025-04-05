import { typeConfig } from 'configs'
import { LocaleSelector } from 'pages/components'
import { layout } from 'pages/tools/locale'

export interface LayoutProps {
  children: any;
  locale: typeConfig.Locale;
  locales: typeConfig.Locale[];
  logoUrl: string;
  onSwitchLocale: (locale: typeConfig.Locale) => void;
}

const Layout = ({
  children, locale, locales, logoUrl, onSwitchLocale,
}: LayoutProps) => (
  <main className='flex flex-col items-center justify-center w-full h-screen bg-layoutColor text-labelColor'>
    <section className='flex flex-col justify-center items-center bg-white box-shadow rounded-lg'>
      <section className='flex flex-col items-center gap-4 max-h-[80vh] p-8 overflow-y-auto overflow-x-hidden'>
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
        <section className='flex flex-col justify-center items-center gap-4'>
          {children}
        </section>
        <a
          target='__blank'
          href='https://github.com/ValueMelody/melody-auth'
          className='text-sm mt-2'
        >
          {layout.poweredByAuth[locale]}
        </a>
      </section>
    </section>
  </main>
)

export default Layout
