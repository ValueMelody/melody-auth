'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import useEditRole from '../useEditRole'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import { Input } from 'components/ui/input'
import { routeTool } from 'tools'
import SaveButton from 'components/SaveButton'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import DeleteButton from 'components/DeleteButton'
import useLocaleRouter from 'hooks/useLocaleRoute'
import {
  useDeleteApiV1RolesByIdMutation, useGetApiV1RolesByIdQuery, usePutApiV1RolesByIdMutation,
} from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const router = useLocaleRouter()

  const {
    data, isLoading,
  } = useGetApiV1RolesByIdQuery({ id: Number(id) })
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

  if (isLoading) return <LoadingPage />

  if (!role) return null

  return (
    <section>
      <Breadcrumb
        className='mb-8'
        page={{ label: t('roles.role') }}
        parent={{
          href: routeTool.Internal.Roles,
          label: t('roles.title'),
        }}
      />
      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='max-md:w-24 md:w-48'>{t('common.property')}</TableHead>
              <TableHead>{t('common.value')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='divide-y'>
            <TableRow>
              <TableCell>{t('roles.name')}</TableCell>
              <TableCell>
                <Input
                  data-testid='nameInput'
                  onChange={(e) => onChange(
                    'name',
                    e.target.value,
                  )}
                  value={values.name}
                />
                {showErrors && <FieldError error={errors.name} />}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.note')}</TableCell>
              <TableCell>
                <Input
                  data-testid='noteInput'
                  onChange={(e) => onChange(
                    'note',
                    e.target.value,
                  )}
                  value={values.note}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.createdAt')}</TableCell>
              <TableCell>{role.createdAt} UTC</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.updatedAt')}</TableCell>
              <TableCell>{role.updatedAt} UTC</TableCell>
            </TableRow>
          </TableBody>
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
