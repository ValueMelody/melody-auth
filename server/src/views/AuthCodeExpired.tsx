import {
  localeConfig,
  typeConfig,
} from 'configs'
import Layout from 'views/components/Layout'

const AuthCodeExpired = ({
  logoUrl, locale,
}: {
  logoUrl: string;
  locale: typeConfig.Locale;
}) => {
  return (
    <Layout
      logoUrl={logoUrl}
      locale={locale}
      locales={[locale]}
    >
      <p class='w-text text-red'>
        {localeConfig.authCodeExpired.msg[locale]}
      </p>
    </Layout>
  )
}

export default AuthCodeExpired
