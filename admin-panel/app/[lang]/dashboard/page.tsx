'use client'

import { useTranslations } from 'next-intl'
import {
  Spinner, Table,
} from 'flowbite-react'
import ConfigBooleanValue from 'components/ConfigBooleanValue'
import PageTitle from 'components/PageTitle'
import { configSignal } from 'signals'
import useSignalValue from 'app/useSignalValue'

const Page = () => {
  const t = useTranslations()

  const configs = useSignalValue(configSignal)

  if (!configs) return <Spinner />

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('dashboard.configs')} />
      <Table>
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
            <Table.Cell>COMPANY_LOGO_URL</Table.Cell>
            <Table.Cell className='break-all'>{configs.COMPANY_LOGO_URL}</Table.Cell>
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
            <Table.Cell>ENABLE_USER_APP_CONSENT</Table.Cell>
            <Table.Cell>
              <ConfigBooleanValue config={configs.ENABLE_USER_APP_CONSENT} />
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
