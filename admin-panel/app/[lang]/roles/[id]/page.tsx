'use client'

import {
  Table,
  TextInput,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import useEditRole from '../useEditRole'
import { routeTool } from 'tools'
import SaveButton from 'components/SaveButton'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import PageTitle from 'components/PageTitle'
import DeleteButton from 'components/DeleteButton'
import useLocaleRouter from 'hooks/useLocaleRoute'
import {
  useDeleteApiV1RolesByIdMutation, useGetApiV1RolesByIdQuery, usePutApiV1RolesByIdMutation,
} from 'services/auth/api'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const router = useLocaleRouter()

  const { data } = useGetApiV1RolesByIdQuery({ id: Number(id) })
  const [updateRole, { isLoading: isUpdating }] = usePutApiV1RolesByIdMutation()
  const [deleteRole, { isLoading: isDeleting }] = useDeleteApiV1RolesByIdMutation()

  const role = data?.role

  const {
    values, errors, onChange,
  } = useEditRole(role)
  const [showErrors, setShowErrors] = useState(false)

  const handleSave = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    await updateRole({
      id: Number(id),
      putRoleReq: values,
    })
  }

  const handleDelete = async () => {
    await deleteRole({ id: Number(id) })

    router.push(routeTool.Internal.Roles)
  }

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
            <Table.HeadCell className='max-md:w-24 md:w-48'>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            <Table.Row>
              <Table.Cell>{t('roles.name')}</Table.Cell>
              <Table.Cell>
                <TextInput
                  data-testid='nameInput'
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
                  data-testid='noteInput'
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
          isLoading={isUpdating}
          disabled={!values.name || (values.name === role.name && values.note === role.note)}
          onClick={handleSave}
        />
        <DeleteButton
          isLoading={isDeleting}
          disabled={isUpdating}
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
