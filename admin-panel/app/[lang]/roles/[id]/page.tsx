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
import useEditRole from '../useEditRole'
import {
  proxyTool, routeTool,
} from 'tools'
import SaveButton from 'components/SaveButton'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import PageTitle from 'components/PageTitle'
import DeleteButton from 'components/DeleteButton'
import useLocaleRouter from 'hooks/useLocaleRoute'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const router = useLocaleRouter()

  const [role, setRole] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const { acquireToken } = useAuth()

  const {
    values, errors, onChange,
  } = useEditRole(role)
  const [showErrors, setShowErrors] = useState(false)

  const handleSave = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    const token = await acquireToken()
    setIsLoading(true)
    const res = await proxyTool.sendNextRequest({
      endpoint: `/api/roles/${id}`,
      method: 'PUT',
      token,
      body: { data: values },
    })
    if (res?.role) {
      getRole()
    }
    setIsLoading(false)
  }

  const getRole = useCallback(
    async () => {
      const token = await acquireToken()
      const data = await proxyTool.sendNextRequest({
        endpoint: `/api/roles/${id}`,
        method: 'GET',
        token,
      })
      setRole(data.role)
    },
    [acquireToken, id],
  )

  const handleDelete = async () => {
    const token = await acquireToken()
    setIsLoading(true)
    await proxyTool.sendNextRequest({
      endpoint: `/api/roles/${id}`,
      method: 'DELETE',
      token,
    })
    router.push(routeTool.Internal.Roles)
    setIsLoading(false)
  }

  useEffect(
    () => {
      getRole()
    },
    [getRole],
  )

  if (!role) return null

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('roles.role')}
      />
      <section>
        <Table>
          <Table.Head>
            <Table.HeadCell className='w-48'>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            <Table.Row>
              <Table.Cell>{t('roles.name')}</Table.Cell>
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
              <Table.Cell>{t('common.note')}</Table.Cell>
              <Table.Cell>
                <TextInput
                  onChange={(e) => onChange(
                    'note',
                    e.target.value,
                  )}
                  value={values.note} />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.createdAt')}</Table.Cell>
              <Table.Cell>{role.createdAt} UTC</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.updatedAt')}</Table.Cell>
              <Table.Cell>{role.updatedAt} UTC</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </section>
      <SubmitError />
      <section className='flex items-center gap-4 mt-8'>
        <SaveButton
          isLoading={isLoading}
          disabled={!values.name || (values.name === role.name && values.note === role.note)}
          onClick={handleSave}
        />
        <DeleteButton
          isLoading={isLoading}
          confirmDeleteTitle={t(
            'common.deleteConfirm',
            { item: values.name },
          )}
          onConfirmDelete={handleDelete}
        />
      </section>
    </section>
  )
}

export default Page
