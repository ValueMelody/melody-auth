'use client'

import { useAuth } from '@melody-auth/react'
import {
  Table,
  TextInput,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useCallback,
  useEffect, useState,
} from 'react'
import useEditScope from '../useEditScope'
import { proxyTool } from 'tools'
import SaveButton from 'components/SaveButton'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import ClientTypeLabel from 'components/ClientTypeLabel'
import PageTitle from 'components/PageTitle'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()

  const [scope, setScope] = useState()
  const { acquireToken } = useAuth()

  const {
    values, errors, onChange,
  } = useEditScope(scope)
  const [showErrors, setShowErrors] = useState(false)

  const handleSave = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    const token = await acquireToken()
    const res = await proxyTool.sendNextRequest({
      endpoint: `/api/scopes/${id}`,
      method: 'PUT',
      token,
      body: { data: values },
    })
    if (res?.scope) {
      getScope()
    }
  }

  const getScope = useCallback(
    async () => {
      const token = await acquireToken()
      const data = await proxyTool.sendNextRequest({
        endpoint: `/api/scopes/${id}`,
        method: 'GET',
        token,
      })
      setScope(data.scope)
    },
    [acquireToken, id],
  )

  useEffect(
    () => {
      getScope()
    },
    [getScope],
  )

  if (!scope) return null

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('scopes.scope')} />
      <section>
        <Table>
          <Table.Head>
            <Table.HeadCell>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
            <Table.HeadCell />
          </Table.Head>
          <Table.Body className='divide-y'>
            <Table.Row>
              <Table.Cell>{t('scopes.name')}</Table.Cell>
              <Table.Cell>
                <TextInput
                  onChange={(e) => onChange(
                    'name',
                    e.target.value,
                  )}
                  value={values.name} />
                {showErrors && <FieldError error={errors.name} />}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('scopes.type')}</Table.Cell>
              <Table.Cell>
                <ClientTypeLabel type={scope.type} />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.createdAt')}</Table.Cell>
              <Table.Cell>{scope.createdAt} UTC</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.updatedAt')}</Table.Cell>
              <Table.Cell>{scope.updatedAt} UTC</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </section>
      <SubmitError />
      <SaveButton
        disabled={!values.name || values.name === scope.name}
        onClick={handleSave}
      />
    </section>
  )
}

export default Page
