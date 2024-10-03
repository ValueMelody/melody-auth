'use client'

import {
  Table,
  TextInput,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import useEditRole from '../useEditRole'
import { routeTool } from 'tools'
import PageTitle from 'components/PageTitle'
import SaveButton from 'components/SaveButton'
import useLocaleRouter from 'hooks/useLocaleRoute'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import { usePostApiV1RolesMutation } from 'services/auth/api'

const Page = () => {
  const t = useTranslations()
  const router = useLocaleRouter()

  const {
    values, errors, onChange,
  } = useEditRole(undefined)
  const [showErrors, setShowErrors] = useState(false)
  const [createRole, { isLoading: isCreating }] = usePostApiV1RolesMutation()

  const handleSubmit = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    const res = await createRole({ postRoleReq: values })

    if (res.data?.role?.id) {
      router.push(`${routeTool.Internal.Roles}/${res.data.role.id}`)
    }
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
            <Table.HeadCell className='max-md:w-24 md:w-48 '>{t('common.property')}</Table.HeadCell>
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
        isLoading={isCreating}
        onClick={handleSubmit}
      />
    </section>
  )
}

export default Page
