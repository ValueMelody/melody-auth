'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import useEditRole from '../useEditRole'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import { Input } from 'components/ui/input'
import { routeTool } from 'tools'
import SaveButton from 'components/SaveButton'
import { useRouter } from 'i18n/navigation'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import { usePostApiV1RolesMutation } from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import RequiredProperty from 'components/RequiredProperty'

const Page = () => {
  const t = useTranslations()
  const router = useRouter()

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
      <Breadcrumb
        className='mb-8'
        page={{ label: t('roles.new') }}
        parent={{
          label: t('roles.title'),
          href: routeTool.Internal.Roles,
        }}
      />
      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='max-md:w-24 md:w-48 '>{t('common.property')}</TableHead>
              <TableHead>{t('common.value')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='divide-y'>
            <TableRow>
              <TableCell>
                <RequiredProperty title={t('roles.name')} />
              </TableCell>
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
