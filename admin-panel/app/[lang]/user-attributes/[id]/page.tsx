'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useMemo, useState,
} from 'react'
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
import LocaleEditor from 'components/LocaleEditor'
import { configSignal } from 'signals'
import useSignalValue from 'app/useSignalValue'
import RequiredProperty from 'components/RequiredProperty'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const router = useRouter()

  const configs = useSignalValue(configSignal)

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

  const hasDifferentLocales = useMemo(
    () => {
      if (values.locales !== undefined && userAttribute?.locales === undefined) return true
      if (Array.isArray(values.locales) && Array.isArray(userAttribute?.locales)) {
        if (values.locales.length !== userAttribute.locales.length) return true
        if (values.locales.find((valueLocale) => {
          return userAttribute?.locales?.every((attributeLocale) => {
            return attributeLocale.locale !== valueLocale.locale || attributeLocale.value !== valueLocale.value
          })
        })) return true
      }
      return false
    },
    [values, userAttribute],
  )

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

  const handleChangeIncludeInSignUpForm = () => {
    const value = !values.includeInSignUpForm
    onChange(
      'includeInSignUpForm',
      value,
    )
    if (!value && values.requiredInSignUpForm) {
      onChange(
        'requiredInSignUpForm',
        false,
      )
    }
  }

  if (isLoading) return <LoadingPage />

  if (!userAttribute) return null

  return (
    <section>
      <Breadcrumb
        page={{ label: userAttribute.name }}
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
              <TableCell>
                <RequiredProperty title={t('userAttributes.name')} />
              </TableCell>
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
              <TableCell>{t('userAttributes.locales')}</TableCell>
              <TableCell>
                <LocaleEditor
                  description={`* ${t('userAttributes.localeNote')}`}
                  supportedLocales={configs.SUPPORTED_LOCALES}
                  values={values.locales}
                  disabled={!canWriteUserAttribute}
                  onChange={(values) => onChange(
                    'locales',
                    values,
                  )}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('userAttributes.includeInSignUpForm')}</TableCell>
              <TableCell>
                <Switch
                  checked={values.includeInSignUpForm}
                  disabled={!canWriteUserAttribute}
                  onClick={handleChangeIncludeInSignUpForm}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('userAttributes.requiredInSignUpForm')}</TableCell>
              <TableCell>
                <div className='flex items-center gap-4'>
                  <Switch
                    checked={values.requiredInSignUpForm}
                    disabled={!canWriteUserAttribute || !values.includeInSignUpForm}
                    onClick={() => onChange(
                      'requiredInSignUpForm',
                      !values.requiredInSignUpForm,
                    )}
                  />
                  <p>{t('userAttributes.requiredAttributeNote')}</p>
                </div>
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
              <TableCell>{t('userAttributes.uniqueAttribute')}</TableCell>
              <TableCell>
                <div className='flex items-center gap-4'>
                  <Switch
                    checked={values.unique}
                    disabled={!canWriteUserAttribute}
                    onClick={() => onChange(
                      'unique',
                      !values.unique,
                    )}
                  />
                  <p>{t('userAttributes.uniqueAttributeNote')}</p>
                </div>
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
              values.includeInUserInfo === userAttribute.includeInUserInfo &&
              values.unique === userAttribute.unique &&
              !hasDifferentLocales
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
