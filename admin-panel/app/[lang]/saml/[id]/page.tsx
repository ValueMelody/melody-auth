'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import { Input } from 'components/ui/input'
import { routeTool } from 'tools'
import SaveButton from 'components/SaveButton'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import DeleteButton from 'components/DeleteButton'
import { useRouter } from 'i18n/navigation'
import {
  useDeleteApiV1SamlIdpsByIdMutation, useGetApiV1SamlIdpsByIdQuery, usePutApiV1SamlIdpsByIdMutation,
} from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'
import useEditSaml from 'app/[lang]/saml/useEditSaml'
import { Textarea } from '@/components/ui/textarea'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const router = useRouter()

  const {
    data, isLoading,
  } = useGetApiV1SamlIdpsByIdQuery({ id: Number(id) })
  const [updateIdp, { isLoading: isUpdating }] = usePutApiV1SamlIdpsByIdMutation()
  const [deleteIdp, { isLoading: isDeleting }] = useDeleteApiV1SamlIdpsByIdMutation()

  const idp = data?.idp

  const {
    values, errors, onChange,
  } = useEditSaml(idp)
  const [showErrors, setShowErrors] = useState(false)

  const handleSave = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    await updateIdp({
      id: Number(id),
      putSamlIdpReq: values,
    })
  }

  const handleDelete = async () => {
    await deleteIdp({ id: Number(id) })

    router.push(routeTool.Internal.Saml)
  }

  if (isLoading) return <LoadingPage />

  if (!idp) return null

  return (
    <section>
      <Breadcrumb
        className='mb-8'
        page={{ label: t('saml.idp') }}
        parent={{
          href: routeTool.Internal.Saml,
          label: t('saml.title'),
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
              <TableCell>{t('saml.name')}</TableCell>
              <TableCell>
                {idp.name}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('saml.userIdAttribute')}</TableCell>
              <TableCell>
                <Input
                  data-testid='userIdAttributeInput'
                  onChange={(e) => onChange(
                    'userIdAttribute',
                    e.target.value,
                  )}
                  value={values.userIdAttribute}
                />
                {showErrors && <FieldError error={errors.userIdAttribute} />}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('saml.emailAttribute')}</TableCell>
              <TableCell>
                <Input
                  data-testid='emailAttributeInput'
                  onChange={(e) => onChange(
                    'emailAttribute',
                    e.target.value,
                  )}
                  value={values.emailAttribute}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('saml.firstNameAttribute')}</TableCell>
              <TableCell>
                <Input
                  data-testid='firstNameAttributeInput'
                  onChange={(e) => onChange(
                    'firstNameAttribute',
                    e.target.value,
                  )}
                  value={values.firstNameAttribute}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('saml.lastNameAttribute')}</TableCell>
              <TableCell>
                <Input
                  data-testid='lastNameAttributeInput'
                  onChange={(e) => onChange(
                    'lastNameAttribute',
                    e.target.value,
                  )}
                  value={values.lastNameAttribute}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('saml.metadata')}</TableCell>
              <TableCell>
                <Textarea
                  className='min-h-[400px]'
                  data-testid='metadataInput'
                  onChange={(e) => onChange(
                    'metadata',
                    e.target.value,
                  )}
                  value={values.metadata}
                />
                {showErrors && <FieldError error={errors.metadata} />}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.createdAt')}</TableCell>
              <TableCell>{idp.createdAt} UTC</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.updatedAt')}</TableCell>
              <TableCell>{idp.updatedAt} UTC</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
      <SubmitError />
      <section className='flex items-center gap-4 mt-8'>
        <SaveButton
          isLoading={isUpdating}
          disabled={
            !values.userIdAttribute ||
            !values.metadata || (
              values.userIdAttribute === idp.userIdAttribute &&
              values.emailAttribute === idp.emailAttribute &&
              values.firstNameAttribute === idp.firstNameAttribute &&
              values.lastNameAttribute === idp.lastNameAttribute &&
              values.metadata === idp.metadata
            )
          }
          onClick={handleSave}
        />
        <DeleteButton
          isLoading={isDeleting}
          disabled={isUpdating}
          confirmDeleteTitle={t(
            'common.deleteConfirm',
            { item: idp.name },
          )}
          onConfirmDelete={handleDelete}
        />
      </section>
    </section>
  )
}

export default Page
