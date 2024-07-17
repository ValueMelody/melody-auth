import { localeConfig } from 'configs'
import Layout from 'templates/components/Layout'
import PoweredBy from 'templates/components/PoweredBy'

const EmailVerificationEmail = ({
  logoUrl, verificationCode, oauthId,
}: {
  logoUrl: string;
  verificationCode: string;
  oauthId: string;
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
          href={`/account/verify-email?code=${verificationCode}&id=${oauthId}`}
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
