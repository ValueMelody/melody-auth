import {
  ValidationError, ObjectSchema, string,
  array,
  ref,
} from 'yup'
import { typeConfig } from 'configs'
import { validateError } from 'pages/tools/locale'

export const emailField = (locale: typeConfig.Locale) => {
  return string()
    .required(validateError.emailIsRequired[locale])
    .email(validateError.wrongEmailFormat[locale])
}

export const requiredField = (locale: typeConfig.Locale) => {
  return string().required(validateError.fieldIsRequired[locale])
}

export const passwordField = (locale: typeConfig.Locale) => {
  return string()
    .required(validateError.passwordIsRequired[locale])
    .matches(
      /[A-Z]/,
      validateError.passwordFormat[locale],
    )
    .matches(
      /[a-z]/,
      validateError.passwordFormat[locale],
    )
    .matches(
      /[0-9]/,
      validateError.passwordFormat[locale],
    )
    .matches(
      /[@$!%*?&#^()_\-+={}[\]<>|~`]/,
      validateError.passwordFormat[locale],
    )
    .min(
      8,
      validateError.passwordFormat[locale],
    )
}

export const confirmPasswordField = (locale: typeConfig.Locale) => {
  return string().oneOf(
    [ref('password')],
    validateError.passwordNotMatch[locale],
  )
}
export const codeField = (locale: typeConfig.Locale) => {
  return array()
    .test(
      'is-valid-mfa-code',
      validateError.verificationCodeLengthIssue[locale],
      function (
        _, context,
      ) {
        const mfaArray = context.parent.mfaCode
        if (!Array.isArray(mfaArray) || mfaArray.length !== 6) return false
        return mfaArray.every((digit) => /^\d$/.test(digit))
      },
    )
}

export const validate = <T extends object>(schema: ObjectSchema<T>, values: T): Record<keyof T, string | undefined> => {
  const keys = Object.keys(values) as Array<keyof T>
  const errors = keys.reduce(
    (
      acc, key,
    ) => ({
      ...acc, [key]: undefined,
    }),
    {} as Record<keyof T, string | undefined>,
  )

  try {
    schema.validateSync(
      values,
      { abortEarly: false },
    )
  } catch (e) {
    if ((e as ValidationError).inner) {
      (e as ValidationError).inner.forEach((err) => {
        errors[err.path as keyof T] = err.message
      })
    }
  }
  return errors
}
