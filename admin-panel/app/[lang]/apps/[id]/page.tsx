'use client'

import { useAuth } from '@melody-auth/react'
import {
  Table,
  TableCell,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useCallback,
  useEffect, useState,
} from 'react'
import { proxyTool } from 'tools'
import EntityStatus from 'components/EntityStatus'
import AppScopes from 'components/AppScopes'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()

  const [app, setApp] = useState()
  const { acquireToken } = useAuth()

  const getApp = useCallback(
    async () => {
      const token = await acquireToken()
      const data = await proxyTool.sendNextRequest({
        endpoint: `/api/apps/${id}`,
        method: 'GET',
        token,
      })
      setApp(data.app)
    },
    [acquireToken, id],
  )

  // const enableApp = async () => {
  //   const token = await acquireToken()
  //   const result = await proxyTool.sendNextRequest({
  //     endpoint: `/api/apps/${id}`,
  //     method: 'PUT',
  //     token,
  //     body: { action: 'enable' },
  //   })
  //   if (result) await getApp()
  // }

  // const disableApp = async () => {
  //   const token = await acquireToken()
  //   const result = await proxyTool.sendNextRequest({
  //     endpoint: `/api/apps/${id}`,
  //     method: 'PUT',
  //     token,
  //     body: { action: 'disable' },
  //   })
  //   if (result) await getApp()
  // }

  useEffect(
    () => {
      getApp()
    },
    [getApp],
  )

  if (!app) return null

  return (
    <section>
      <section>
        <Table>
          <Table.Head>
            <Table.HeadCell>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
            <Table.HeadCell />
          </Table.Head>
          <Table.Body className='divide-y'>
            <Table.Row>
              <Table.Cell>{t('apps.clientId')}</Table.Cell>
              <Table.Cell>{app.clientId}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.name')}</Table.Cell>
              <Table.Cell>{app.name}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.status')}</Table.Cell>
              <Table.Cell>
                <EntityStatus isEnabled={!app.deletedAt} />
              </Table.Cell>
              <TableCell>
              </TableCell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.type')}</Table.Cell>
              <Table.Cell>
                {app.type.toUpperCase()}
              </Table.Cell>
              <Table.Cell />
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.scopes')}</Table.Cell>
              <Table.Cell>
                <AppScopes app={app} />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.redirectUris')}</Table.Cell>
              <Table.Cell>{app.redirectUris}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.createdAt')}</Table.Cell>
              <Table.Cell>{app.createdAt} UTC</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.updatedAt')}</Table.Cell>
              <Table.Cell>{app.updatedAt} UTC</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </section>
    </section>
  )
}

export default Page
