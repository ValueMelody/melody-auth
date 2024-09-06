'use client'

import {
  Table,
  TextInput,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useAuth } from '@melody-auth/react'
import useEditRole from '../useEditRole'
import {
  proxyTool, routeTool,
} from 'tools'
import PageTitle from 'components/PageTitle'
import SaveButton from 'components/SaveButton'
import useLocaleRouter from 'hooks/useLocaleRoute'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'

const Page = () => {
  const t = useTranslations()
  const router = useLocaleRouter()

  const { acquireToken } = useAuth()
  const {
    values, errors, onChange,
  } = useEditRole()
  const [showErrors, setShowErrors] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    const token = await acquireToken()
    setIsLoading(true)
    const res = await proxyTool.sendNextRequest({
      endpoint: '/api/roles',
      method: 'POST',
      token,
      body: { data: values },
    })

    if (res?.role?.id) {
      router.push(`${routeTool.Internal.Roles}/${res.role.id}`)
    }
    setIsLoading(false)
  }

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('roles.new')}
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
                  value={values.note}
                />
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </section>
      <SubmitError />
      <SaveButton
        className='mt-8'
        isLoading={isLoading}
        onClick={handleSubmit}
      />
    </section>
  )
}

export default Page
