'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@melody-auth/react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import { Input } from 'components/ui/input'
import {
  routeTool, accessTool,
} from 'tools'
import SaveButton from 'components/SaveButton'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import DeleteButton from 'components/DeleteButton'
import { useRouter } from 'i18n/navigation'
import {
  useGetApiV1UserAttributesByIdQuery,
  usePutApiV1UserAttributesByIdMutation,
  useDeleteApiV1UserAttributesByIdMutation,
} from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'
import useEditUserAttribute from 'app/[lang]/user-attributes/useEditUserAttribute'
import { Switch } from 'components/ui/switch'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const router = useRouter()

  const {
    data, isLoading,
  } = useGetApiV1UserAttributesByIdQuery({ id: Number(id) })
  const [updateUserAttribute, { isLoading: isUpdating }] = usePutApiV1UserAttributesByIdMutation()
  const [deleteUserAttribute, { isLoading: isDeleting }] = useDeleteApiV1UserAttributesByIdMutation()

  const { userInfo } = useAuth()
  const canWriteUserAttribute = accessTool.isAllowedAccess(
    accessTool.Access.WriteUserAttribute,
    userInfo?.roles,
  )

  const userAttribute = data?.userAttribute

  const {
    values, errors, onChange,
  } = useEditUserAttribute(userAttribute)
  const [showErrors, setShowErrors] = useState(false)

  const handleSave = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    await updateUserAttribute({
      id: Number(id),
      putUserAttributeReq: values,
    })
  }

  const handleDelete = async () => {
    await deleteUserAttribute({ id: Number(id) })

    router.push(routeTool.Internal.UserAttributes)
  }

  if (isLoading) return <LoadingPage />

  if (!userAttribute) return null

  return (
    <section>
      <Breadcrumb
        className='mb-8'
        page={{ label: t('userAttributes.userAttribute') }}
        parent={{
          href: routeTool.Internal.UserAttributes,
          label: t('userAttributes.title'),
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
              <TableCell>{t('userAttributes.name')}</TableCell>
              <TableCell>
                <Input
                  data-testid='nameInput'
                  disabled={!canWriteUserAttribute}
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
              <TableCell>{t('userAttributes.includeInSignUpForm')}</TableCell>
              <TableCell>
                <Switch
                  checked={values.includeInSignUpForm}
                  disabled={!canWriteUserAttribute}
                  onClick={() => onChange(
                    'includeInSignUpForm',
                    !values.includeInSignUpForm,
                  )}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('userAttributes.requiredInSignUpForm')}</TableCell>
              <TableCell>
                <Switch
                  checked={values.requiredInSignUpForm}
                  disabled={!canWriteUserAttribute}
                  onClick={() => onChange(
                    'requiredInSignUpForm',
                    !values.requiredInSignUpForm,
                  )}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('userAttributes.includeInIdTokenBody')}</TableCell>
              <TableCell>
                <Switch
                  checked={values.includeInIdTokenBody}
                  disabled={!canWriteUserAttribute}
                  onClick={() => onChange(
                    'includeInIdTokenBody',
                    !values.includeInIdTokenBody,
                  )}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('userAttributes.includeInUserInfo')}</TableCell>
              <TableCell>
                <Switch
                  checked={values.includeInUserInfo}
                  disabled={!canWriteUserAttribute}
                  onClick={() => onChange(
                    'includeInUserInfo',
                    !values.includeInUserInfo,
                  )}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.createdAt')}</TableCell>
              <TableCell>{userAttribute.createdAt} UTC</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.updatedAt')}</TableCell>
              <TableCell>{userAttribute.updatedAt} UTC</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
      <SubmitError />
      {canWriteUserAttribute && (
        <section className='flex items-center gap-4 mt-8'>
          <SaveButton
            isLoading={isUpdating}
            disabled={!values.name || (
              values.name === userAttribute.name &&
              values.includeInSignUpForm === userAttribute.includeInSignUpForm &&
              values.requiredInSignUpForm === userAttribute.requiredInSignUpForm &&
              values.includeInIdTokenBody === userAttribute.includeInIdTokenBody &&
              values.includeInUserInfo === userAttribute.includeInUserInfo
            )}
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
      )}
    </section>
  )
}

export default Page
