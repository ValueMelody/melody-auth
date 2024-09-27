'use client'

import { useTranslations } from 'next-intl'
import {
  Spinner, Table,
} from 'flowbite-react'
import { useMemo } from 'react'
import ConfigBooleanValue from 'components/ConfigBooleanValue'
import PageTitle from 'components/PageTitle'
import { configSignal } from 'signals'
import useSignalValue from 'app/useSignalValue'

const Page = () => {
  const t = useTranslations()

  const configs = useSignalValue(configSignal)

  const links = useMemo(
    () => ({
      openidConfig: `${configs.AUTH_SERVER_URL}/.well-known/openid-configuration`,
      jwks: `${configs.AUTH_SERVER_URL}/.well-known/jwks.json`,
      apiSwagger: `${configs.AUTH_SERVER_URL}/api/v1/swagger`,
      systemInfo: `${configs.AUTH_SERVER_URL}/info`,
    }),
    [configs],
  )

  if (!configs) return <Spinner />

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('dashboard.links')}
      />
      <Table className='break-all'>
        <Table.Head>
          <Table.HeadCell>{t('dashboard.configName')}</Table.HeadCell>
          <Table.HeadCell>{t('dashboard.configValue')}</Table.HeadCell>
        </Table.Head>
        <Table.Body className='divide-y'>
          <Table.Row>
            <Table.Cell>OPENID CONFIGURATION</Table.Cell>
            <Table.Cell>
              <a
                target='_blank'
                href={links.openidConfig}
                rel='noreferrer'
              >
                {links.openidConfig}
              </a>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>JWKS</Table.Cell>
            <Table.Cell>
              <a
                target='_blank'
                href={links.jwks}
                rel='noreferrer'
              >
                {links.jwks}
              </a>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>{t('dashboard.apiSwagger')}</Table.Cell>
            <Table.Cell>
              <a
                target='_blank'
                href={links.apiSwagger}
                rel='noreferrer'
              >
                {links.apiSwagger}
              </a>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>{t('dashboard.systemInfo')}</Table.Cell>
            <Table.Cell>
              <a
                target='_blank'
                href={links.systemInfo}
                rel='noreferrer'
              >
                {links.systemInfo}
              </a>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <PageTitle
        className='mt-8 mb-6'
        title={t('dashboard.configs')}
      />
      <Table className='break-all'>
        <Table.Head>
          <Table.HeadCell>{t('dashboard.configName')}</Table.HeadCell>
          <Table.HeadCell>{t('dashboard.configValue')}</Table.HeadCell>
        </Table.Head>
        <Table.Body className='divide-y'>
          <Table.Row>
            <Table.Cell>AUTH_SERVER_URL</Table.Cell>
            <Table.Cell>{configs.AUTH_SERVER_URL}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>GOOGLE_AUTH_CLIENT_ID</Table.Cell>
            <Table.Cell>{configs.GOOGLE_AUTH_CLIENT_ID}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>FACEBOOK_AUTH_CLIENT_ID</Table.Cell>
            <Table.Cell>{configs.FACEBOOK_AUTH_CLIENT_ID}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>GITHUB_AUTH_CLIENT_ID</Table.Cell>
            <Table.Cell>{configs.GITHUB_AUTH_CLIENT_ID}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>GITHUB_AUTH_APP_NAME</Table.Cell>
            <Table.Cell>{configs.GITHUB_AUTH_APP_NAME}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>SUPPORTED_LOCALES</Table.Cell>
            <Table.Cell>{configs.SUPPORTED_LOCALES.join(', ')}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ENABLE_LOCALE_SELECTOR</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.ENABLE_LOCALE_SELECTOR} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>COMPANY_LOGO_URL</Table.Cell>
            <Table.Cell className='break-all'>{configs.COMPANY_LOGO_URL}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>EMAIL_SENDER_NAME</Table.Cell>
            <Table.Cell className='break-all'>{configs.EMAIL_SENDER_NAME}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>TERMS_LINK</Table.Cell>
            <Table.Cell>{configs.TERMS_LINK}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>PRIVACY_POLICY_LINK</Table.Cell>
            <Table.Cell>{configs.PRIVACY_POLICY_LINK}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ENABLE_NAMES</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.ENABLE_NAMES} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>NAMES_IS_REQUIRED</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.NAMES_IS_REQUIRED} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ENABLE_SIGN_UP</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.ENABLE_SIGN_UP} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ENABLE_PASSWORD_SIGN_IN</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.ENABLE_PASSWORD_SIGN_IN} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ENABLE_EMAIL_VERIFICATION</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.ENABLE_EMAIL_VERIFICATION} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ENABLE_PASSWORD_RESET</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.ENABLE_PASSWORD_RESET} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>PASSWORD_RESET_EMAIL_THRESHOLD</Table.Cell>
            <Table.Cell>
              {configs.PASSWORD_RESET_EMAIL_THRESHOLD}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ENABLE_USER_APP_CONSENT</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.ENABLE_USER_APP_CONSENT} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>OTP_MFA_IS_REQUIRED</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.OTP_MFA_IS_REQUIRED} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>SMS_MFA_IS_REQUIRED</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.SMS_MFA_IS_REQUIRED} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>SMS_MFA_MESSAGE_THRESHOLD</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.SMS_MFA_MESSAGE_THRESHOLD} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>EMAIL_MFA_IS_REQUIRED</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.EMAIL_MFA_IS_REQUIRED} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>EMAIL_MFA_EMAIL_THRESHOLD</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.EMAIL_MFA_EMAIL_THRESHOLD} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ENFORCE_ONE_MFA_ENROLLMENT</Table.Cell>
            <Table.Cell>
              {configs.ENFORCE_ONE_MFA_ENROLLMENT.join(', ')}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ALLOW_EMAIL_MFA_AS_BACKUP</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.ALLOW_EMAIL_MFA_AS_BACKUP} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ACCOUNT_LOCKOUT_THRESHOLD</Table.Cell>
            <Table.Cell>{configs.ACCOUNT_LOCKOUT_THRESHOLD}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ACCOUNT_LOCKOUT_EXPIRES_IN</Table.Cell>
            <Table.Cell>{configs.ACCOUNT_LOCKOUT_EXPIRES_IN} {t('dashboard.configSeconds')}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>UNLOCK_ACCOUNT_VIA_PASSWORD_RESET</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.UNLOCK_ACCOUNT_VIA_PASSWORD_RESET} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ENABLE_EMAIL_LOG</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.ENABLE_EMAIL_LOG} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ENABLE_SIGN_IN_LOG</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.ENABLE_SIGN_IN_LOG} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>AUTHORIZATION_CODE_EXPIRES_IN</Table.Cell>
            <Table.Cell>{configs.AUTHORIZATION_CODE_EXPIRES_IN} {t('dashboard.configSeconds')}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ID_TOKEN_EXPIRES_IN</Table.Cell>
            <Table.Cell>{configs.ID_TOKEN_EXPIRES_IN} {t('dashboard.configSeconds')}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>SPA_ACCESS_TOKEN_EXPIRES_IN</Table.Cell>
            <Table.Cell>{configs.SPA_ACCESS_TOKEN_EXPIRES_IN} {t('dashboard.configSeconds')}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>SPA_REFRESH_TOKEN_EXPIRES_IN</Table.Cell>
            <Table.Cell>{configs.SPA_REFRESH_TOKEN_EXPIRES_IN} {t('dashboard.configSeconds')}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>S2S_ACCESS_TOKEN_EXPIRES_IN</Table.Cell>
            <Table.Cell>{configs.S2S_ACCESS_TOKEN_EXPIRES_IN} {t('dashboard.configSeconds')}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>SERVER_SESSION_EXPIRES_IN</Table.Cell>
            <Table.Cell>{configs.SERVER_SESSION_EXPIRES_IN} {t('dashboard.configSeconds')}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </section>
  )
}

export default Page
