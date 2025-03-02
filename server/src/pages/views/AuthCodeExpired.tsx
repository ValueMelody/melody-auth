import {
  localeConfig,
  typeConfig,
} from 'configs'
import { getAuthCodeExpiredParams } from 'pages/tools/param'
const AuthCodeExpired = ({ locale }: {
  locale: typeConfig.Locale;
}) => {
  const authCodeExpiredParams = getAuthCodeExpiredParams()

  return (
    <>
      <p class='w-(--text-width) text-criticalIndicatorColor'>
        {localeConfig.authCodeExpired.msg[locale]}
      </p>
      {authCodeExpiredParams.redirectUri && (
        <a
          className='mt-6'
          href={authCodeExpiredParams.redirectUri}
        >
          {localeConfig.authCodeExpired.redirect[locale]}
        </a>
      )}
    </>
  )
}

export default AuthCodeExpired
