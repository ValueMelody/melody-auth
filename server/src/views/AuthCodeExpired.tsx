import {
  localeConfig,
  typeConfig,
} from 'configs'
import Layout, { Branding } from 'views/components/Layout'

const AuthCodeExpired = ({
  branding, locale,
}: {
  branding: Branding;
  locale: typeConfig.Locale;
}) => {
  return (
    <Layout
      branding={branding}
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
