import {
  ValidationError, ObjectSchema, string,
  array,
  ref,
} from 'yup'
import {
  localeConfig, typeConfig,
} from 'configs'

export const emailField = (locale: typeConfig.Locale) => {
  return string()
    .required(localeConfig.validateError.emailIsRequired[locale])
    .email(localeConfig.validateError.wrongEmailFormat[locale])
}

export const passwordField = (locale: typeConfig.Locale) => {
  return string()
    .required(localeConfig.validateError.passwordIsRequired[locale])
    .matches(
      /[A-Z]/,
      localeConfig.validateError.passwordFormat[locale],
    )
    .matches(
      /[a-z]/,
      localeConfig.validateError.passwordFormat[locale],
    )
    .matches(
      /[0-9]/,
      localeConfig.validateError.passwordFormat[locale],
    )
    .matches(
      /[@$!%*?&#^()_\-+={}[\]<>|~`]/,
      localeConfig.validateError.passwordFormat[locale],
    )
    .min(
      8,
      localeConfig.validateError.passwordFormat[locale],
    )
}

export const confirmPasswordField = (locale: typeConfig.Locale) => {
  return string().oneOf(
    [ref('password')],
    localeConfig.validateError.passwordNotMatch[locale],
  )
}
export const codeField = (locale: typeConfig.Locale) => {
  return array()
    .test(
      'is-valid-mfa-code',
      localeConfig.validateError.verificationCodeLengthIssue[locale],
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
