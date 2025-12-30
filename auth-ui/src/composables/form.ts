import {
  ValidationError,
  ObjectSchema,
  string,
  array,
  ref,
} from 'yup'
import { useI18n } from 'vue-i18n'
import type { Locale } from '@/api/types'

export interface ValidationMessages {
  emailIsRequired: string
  wrongEmailFormat: string
  passwordIsRequired: string
  passwordFormat: string
  passwordNotMatch: string
  fieldIsRequired: string
  verificationCodeLengthIssue: string
  wrongPhoneFormat: string
  firstNameIsEmpty: string
  lastNameIsEmpty: string
}

export function getValidationMessages(locale: Locale): ValidationMessages {
  const messages: Record<Locale, ValidationMessages> = {
    en: {
      emailIsRequired: 'Email is required!',
      wrongEmailFormat: 'Wrong email format.',
      passwordIsRequired: 'Password is required!',
      passwordFormat: 'Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      passwordNotMatch: 'The password and confirm password do not match.',
      fieldIsRequired: 'This field is required!',
      verificationCodeLengthIssue: 'Verification code can only be 6 characters.',
      wrongPhoneFormat: 'the format must be a number up to fifteen digits in length starting with a \'+\' with country code.',
      firstNameIsEmpty: 'First name can not be empty.',
      lastNameIsEmpty: 'Last name can not be empty.',
    },
    pt: {
      emailIsRequired: 'E-mail e obrigatorio!',
      wrongEmailFormat: 'Formato de e-mail invalido.',
      passwordIsRequired: 'Senha e obrigatoria!',
      passwordFormat: 'A senha deve ter pelo menos 8 caracteres, conter pelo menos uma letra maiuscula, uma minuscula, um numero e um caractere especial.',
      passwordNotMatch: 'A senha e a confirmacao de senha nao coincidem.',
      fieldIsRequired: 'Este campo e obrigatorio!',
      verificationCodeLengthIssue: 'O codigo de verificacao deve conter apenas 6 caracteres.',
      wrongPhoneFormat: 'O formato deve ser um numero de ate quinze digitos comecando com "+" e o codigo do pais.',
      firstNameIsEmpty: 'O nome nao pode estar vazio.',
      lastNameIsEmpty: 'O sobrenome nao pode estar vazio.',
    },
    fr: {
      emailIsRequired: 'L\'adresse e-mail est requise !',
      wrongEmailFormat: 'Format d\'e-mail incorrect.',
      passwordIsRequired: 'Le mot de passe est requis !',
      passwordFormat: 'Le mot de passe doit contenir au moins 8 caracteres, une majuscule, une minuscule, un chiffre et un caractere special.',
      passwordNotMatch: 'Le mot de passe et la confirmation ne correspondent pas.',
      fieldIsRequired: 'Ce champ est requis !',
      verificationCodeLengthIssue: 'Le code de verification doit contenir 6 caracteres.',
      wrongPhoneFormat: 'Le format doit etre un numero de maximum quinze chiffres commencant par un \'+\' avec l\'indicatif du pays.',
      firstNameIsEmpty: 'Le prenom ne peut pas etre vide.',
      lastNameIsEmpty: 'Le nom de famille ne peut pas etre vide.',
    },
  }
  return messages[locale]
}

export const emailField = (messages: ValidationMessages) => {
  return string()
    .required(messages.emailIsRequired)
    .email(messages.wrongEmailFormat)
}

export const requiredField = (messages: ValidationMessages) => {
  return string().required(messages.fieldIsRequired)
}

export const passwordField = (messages: ValidationMessages) => {
  return string()
    .required(messages.passwordIsRequired)
    .matches(/[A-Z]/, messages.passwordFormat)
    .matches(/[a-z]/, messages.passwordFormat)
    .matches(/[0-9]/, messages.passwordFormat)
    .matches(/[@$!%*?&#^()_\-+={}[\]<>|~`]/, messages.passwordFormat)
    .min(8, messages.passwordFormat)
}

export const confirmPasswordField = (messages: ValidationMessages) => {
  return string().oneOf(
    [ref('password')],
    messages.passwordNotMatch
  )
}

export const codeField = (messages: ValidationMessages) => {
  return array()
    .test(
      'is-valid-mfa-code',
      messages.verificationCodeLengthIssue,
      function (_, context) {
        const mfaArray = context.parent.mfaCode
        if (!Array.isArray(mfaArray) || mfaArray.length !== 6) return false
        return mfaArray.every((digit) => /^\d$/.test(digit))
      }
    )
}

export const phoneField = (messages: ValidationMessages, countryCode: string) => {
  const validationRegex = /^\+[1-9]{1}[0-9]{1,14}$/
  return string()
    .test(
      'is-valid-phone',
      messages.wrongPhoneFormat,
      function (value) {
        if (!value) return false
        const fullNumber = countryCode + value.trim()
        return validationRegex.test(fullNumber)
      }
    )
}

export const validate = <T extends object>(
  schema: ObjectSchema<T>,
  values: T
): Record<keyof T, string | undefined> => {
  const keys = Object.keys(values) as Array<keyof T>
  const errors = keys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: undefined,
    }),
    {} as Record<keyof T, string | undefined>
  )

  try {
    schema.validateSync(values, { abortEarly: false })
  } catch (e) {
    if ((e as ValidationError).inner) {
      (e as ValidationError).inner.forEach((err) => {
        errors[err.path as keyof T] = err.message
      })
    }
  }
  return errors
}

export function useFormValidation() {
  const { locale } = useI18n()

  const getMessages = () => getValidationMessages(locale.value as Locale)

  return {
    getMessages,
    emailField: () => emailField(getMessages()),
    passwordField: () => passwordField(getMessages()),
    confirmPasswordField: () => confirmPasswordField(getMessages()),
    requiredField: () => requiredField(getMessages()),
    codeField: () => codeField(getMessages()),
    phoneField: (countryCode: string) => phoneField(getMessages(), countryCode),
    validate,
  }
}
