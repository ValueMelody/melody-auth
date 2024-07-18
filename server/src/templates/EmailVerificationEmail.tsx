import {
  localeConfig, routeConfig,
} from 'configs'
import Layout from 'templates/components/Layout'
import PoweredBy from 'templates/components/PoweredBy'

const EmailVerificationEmail = ({
  logoUrl, verificationCode, authId,
}: {
  logoUrl: string;
  verificationCode: string;
  authId: string;
}) => {
  return (
    <Layout>
      <section class='flex-col items-center gap-4'>
        {!!logoUrl && (
          <img
            class='logo'
            src={logoUrl}
            alt='Logo'
          />
        )}
        <h1>{localeConfig.EmailVerificationEmail.Title}</h1>
        <p>{localeConfig.EmailVerificationEmail.Desc}: {verificationCode}</p>
        <a
          class='button-text mt-4'
          href={`${routeConfig.InternalRoute.Identity}/verify-email?code=${verificationCode}&id=${authId}`}
        >
          {localeConfig.EmailVerificationEmail.VerifyBtn}
        </a>
        <p>{localeConfig.EmailVerificationEmail.ExpiryText}</p>
        <PoweredBy />
      </section>
    </Layout>
  )
}

export default EmailVerificationEmail
