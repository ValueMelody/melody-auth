import {
  useState, useMemo,
} from 'hono/jsx'
import {
  object, string,
} from 'yup'
import {
  routeConfig, typeConfig,
} from 'configs'
import { validate } from 'pages/tools/form'
import { getFollowUpParams } from 'pages/tools/param'
import {
  parseAuthorizeFollowUpValues, parseResponse,
} from 'pages/tools/request'
import { validateError } from 'pages/tools/locale'

export interface UseUpdateInfoFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
}

const useUpdateInfoForm = ({
  locale,
  onSubmitError,
}: UseUpdateInfoFormProps) => {
  const followUpParams = useMemo(
    () => getFollowUpParams(),
    [],
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
  })
  const [success, setSuccess] = useState(false)

  const values = useMemo(
    () => ({
      firstName,
      lastName,
    }),
    [firstName, lastName],
  )

  const updateInfoSchema = object({
    firstName: string().required(validateError.firstNameIsEmpty[locale]),
    lastName: string().required(validateError.lastNameIsEmpty[locale]),
  })

  const errors = validate(
    updateInfoSchema,
    values,
  )

  const handleChange = (
    name: 'firstName' | 'lastName',
    value: string,
  ) => {
    onSubmitError(null)
    setSuccess(false)
    switch (name) {
    case 'firstName':
      setFirstName(value)
      break
    case 'lastName':
      setLastName(value)
      break
    }
  }

  const handleSubmit = (e: Event) => {
    e.preventDefault()

    setTouched({
      firstName: true,
      lastName: true,
    })

    if (Object.values(errors).some((error) => error !== undefined)) {
      return
    }

    setIsSubmitting(true)

    fetch(
      routeConfig.IdentityRoute.UpdateInfo,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...parseAuthorizeFollowUpValues(
            followUpParams,
            locale,
          ),
          firstName,
          lastName,
        }),
      },
    )
      .then(parseResponse)
      .then(() => {
        setSuccess(true)
      })
      .catch((error) => {
        onSubmitError(error)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  return {
    values,
    errors: {
      firstName: touched.firstName ? errors.firstName : undefined,
      lastName: touched.lastName ? errors.lastName : undefined,
    },
    handleChange,
    handleSubmit,
    success,
    redirectUri: followUpParams.redirectUri,
    isSubmitting,
  }
}

export default useUpdateInfoForm
