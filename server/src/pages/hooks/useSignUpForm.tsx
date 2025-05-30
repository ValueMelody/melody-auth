import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import {
  object, string,
  StringSchema,
} from 'yup'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  validate, emailField, passwordField,
  confirmPasswordField,
  requiredField,
} from 'pages/tools/form'
import {
  InitialProps, View,
} from 'pages/hooks'
import {
  handleAuthorizeStep, parseAuthorizeBaseValues,
  parseResponse,
} from 'pages/tools/request'
import { AuthorizeParams } from 'pages/tools/param'
import { validateError } from 'pages/tools/locale'
import { userAttributeModel } from 'models'
import { GetAuthorizeAccountRes } from 'handlers/identity'

export interface UseSignUpFormProps {
  locale: typeConfig.Locale;
  initialProps: InitialProps;
  params: AuthorizeParams;
  onSubmitError: (error: string | null) => void;
  onSwitchView: (view: View) => void;
}

const useSignUpForm = ({
  locale,
  initialProps,
  params,
  onSubmitError,
  onSwitchView,
}: UseSignUpFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({})
  const [userAttributes, setUserAttributes] = useState<userAttributeModel.Record[]>([])

  const [touched, setTouched] = useState(false)

  const values = useMemo(
    () => {
      const val = {
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
      } as Record<string, string>

      userAttributes.forEach((attr) => {
        val[String(attr.id)] = attributeValues[attr.id]
      })

      return val
    },
    [email, password, confirmPassword, firstName, lastName, attributeValues, userAttributes],
  )

  const getSignUpInfo = useCallback(
    () => {
      if (!initialProps.enableUserAttribute) {
        return
      }

      fetch(
        `${routeConfig.IdentityRoute.AuthorizeAccount}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
        .then(parseResponse)
        .then((response) => {
          const attributes = (response as GetAuthorizeAccountRes).userAttributes
          setUserAttributes(attributes)
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [onSubmitError, initialProps.enableUserAttribute],
  )

  const formDefinition = useMemo(
    () => {
      const definition = {
        email: emailField(locale),
        password: passwordField(locale),
        confirmPassword: confirmPasswordField(locale),
        firstName: initialProps.namesIsRequired
          ? string().required(validateError.firstNameIsEmpty[locale])
          : string(),
        lastName: initialProps.namesIsRequired
          ? string().required(validateError.lastNameIsEmpty[locale])
          : string(),
      } as Record<string, StringSchema<string, {}, undefined, ''>>

      userAttributes.forEach((attr) => {
        if (attr.requiredInSignUpForm) {
          definition[String(attr.id)] = requiredField(locale)
        }
      })

      return definition
    },
    [userAttributes, locale, initialProps.namesIsRequired],
  )

  const signUpSchema = object(formDefinition)

  const errors = validate(
    signUpSchema,
    values as any,
  )

  const handleChange = (
    name: 'email' | 'password' | 'confirmPassword' | 'firstName' | 'lastName' | number,
    value: string | Record<string, string>,
  ) => {
    onSubmitError(null)
    switch (name) {
    case 'email':
      setEmail(value as string)
      break
    case 'password':
      setPassword(value as string)
      break
    case 'confirmPassword':
      setConfirmPassword(value as string)
      break
    case 'firstName':
      setFirstName(value as string)
      break
    case 'lastName':
      setLastName(value as string)
      break
    default:
      setAttributeValues((prev) => ({
        ...prev,
        [name]: value as string,
      }))
      break
    }
  }

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault()
      setTouched(true)

      if (Object.values(errors).some((error) => error !== undefined)) {
        return
      }

      setIsSubmitting(true)

      fetch(
        routeConfig.IdentityRoute.AuthorizeAccount,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: initialProps.enableNames ? firstName : undefined,
            lastName: initialProps.enableNames ? lastName : undefined,
            email,
            password,
            attributes: userAttributes.length ? attributeValues : undefined,
            ...parseAuthorizeBaseValues(
              params,
              locale,
            ),
          }),
        },
      )
        .then(parseResponse)
        .then((response) => {
          handleAuthorizeStep(
            response,
            locale,
            onSwitchView,
          )
        })
        .catch((error) => {
          onSubmitError(error)
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [
      params,
      locale,
      onSubmitError,
      initialProps,
      onSwitchView,
      email,
      password,
      firstName,
      lastName,
      errors,
      attributeValues,
      userAttributes,
    ],
  )

  return {
    values,
    errors: touched ? errors : {},
    handleChange,
    handleSubmit,
    isSubmitting,
    userAttributes,
    getSignUpInfo,
  }
}

export default useSignUpForm
