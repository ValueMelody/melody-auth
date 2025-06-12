'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import useEditSaml from '../useEditSaml'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import { Input } from 'components/ui/input'
import { routeTool } from 'tools'
import SaveButton from 'components/SaveButton'
import { useRouter } from 'i18n/navigation'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import { usePostApiV1SamlIdpsMutation } from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import { Textarea } from '@/components/ui/textarea'
import RequiredProperty from 'components/RequiredProperty'

const Page = () => {
  const t = useTranslations()
  const router = useRouter()

  const [name, setName] = useState('')

  const {
    values, errors, onChange,
  } = useEditSaml(undefined)
  const [showErrors, setShowErrors] = useState(false)
  const [createIdp, { isLoading: isCreating }] = usePostApiV1SamlIdpsMutation()

  const handleSubmit = async () => {
    if (!name || Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    const res = await createIdp({
      postSamlIdpReq: {
        ...values,
        name,
      },
    })

    if (res.data?.idp?.id) {
      router.push(`${routeTool.Internal.Saml}/${res.data.idp.id}`)
    }
  }

  return (
    <section>
      <Breadcrumb
        className='mb-8'
        page={{ label: t('saml.new') }}
        parent={{
          label: t('saml.title'),
          href: routeTool.Internal.Saml,
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
                <RequiredProperty title={t('saml.name')} />
              </TableCell>
              <TableCell>
                <Input
                  data-testid='nameInput'
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
                {showErrors && !name && <FieldError error={t('common.fieldIsRequired')} />}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <RequiredProperty title={t('saml.userIdAttribute')} />
              </TableCell>
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
              <TableCell>
                <RequiredProperty title={t('saml.metadata')} />
              </TableCell>
              <TableCell>
                <Textarea
                  className='min-h-[400px]'
                  data-testid='metadataInput'
                  onChange={(e) => onChange(
                    'metadata',
                    e.target.value,
                  )}
                  value={values.metadata}
                  placeholder={samlMetadataExample}
                />
                {showErrors && <FieldError error={errors.metadata} />}
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

export const samlMetadataExample = `Example:
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" entityID="">
  <IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
    <KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
      <X509Data>
        <X509Certificate></X509Certificate>
      </X509Data>
    </KeyInfo>
    </KeyDescriptor>
    <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location=""/>
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:persistent</NameIDFormat>
    <NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:transient</NameIDFormat>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location=""/>
    <Attribute xmlns="urn:oasis:names:tc:SAML:2.0:assertion" Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" FriendlyName="E-Mail Address"/>
    <Attribute xmlns="urn:oasis:names:tc:SAML:2.0:assertion" Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" FriendlyName="Given Name"/>
    <Attribute xmlns="urn:oasis:names:tc:SAML:2.0:assertion" Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" FriendlyName="Name"/>
    <Attribute xmlns="urn:oasis:names:tc:SAML:2.0:assertion" Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" FriendlyName="Surname"/>
    <Attribute xmlns="urn:oasis:names:tc:SAML:2.0:assertion" Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" FriendlyName="Name ID"/>
  </IDPSSODescriptor>
</EntityDescriptor>
`
