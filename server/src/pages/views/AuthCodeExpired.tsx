import { typeConfig } from 'configs'
import { getAuthCodeExpiredParams } from 'pages/tools/param'
import { AuthCodeExpired as AuthCodeExpiredBlock } from 'pages/blocks'

const AuthCodeExpired = ({ locale }: {
  locale: typeConfig.Locale;
}) => {
  const authCodeExpiredParams = getAuthCodeExpiredParams()

  return (
    <AuthCodeExpiredBlock
      locale={locale}
      authCodeExpiredParams={authCodeExpiredParams}
    />
  )
}

export default AuthCodeExpired
