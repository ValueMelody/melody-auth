'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Input } from 'components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import useEditUserAttribute from 'app/[lang]/user-attributes/useEditUserAttribute'
import { routeTool } from 'tools'
import SaveButton from 'components/SaveButton'
import { useRouter } from 'i18n/navigation'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import { usePostApiV1UserAttributesMutation } from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import { Switch } from 'components/ui/switch'

const Page = () => {
  const t = useTranslations()
  const router = useRouter()

  const {
    values, errors, onChange,
  } = useEditUserAttribute(undefined)
  const [showErrors, setShowErrors] = useState(false)
  const [createUserAttribute, { isLoading: isCreating }] = usePostApiV1UserAttributesMutation()

  const handleSubmit = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    const res = await createUserAttribute({ postUserAttributeReq: values })

    if (res.data?.userAttribute?.id) {
      router.push(`${routeTool.Internal.UserAttributes}/${res.data.userAttribute.id}`)
    }
  }

  return (
    <section>
      <Breadcrumb
        className='mb-8'
        page={{ label: t('userAttributes.new') }}
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
                  onClick={() => onChange(
                    'includeInUserInfo',
                    !values.includeInUserInfo,
                  )}
                />
              </TableCell>
            </TableRow>
          </TableBody>
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
