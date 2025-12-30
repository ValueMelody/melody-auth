import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { View, IdentityRoute } from '@/api/types'
import type { Locale } from '@/api/types'

interface RequestErrorMessages {
  authFailed: string
  noUser: string
  disabledUser: string
  accountLocked: string
  optMfaLocked: string
  smsMfaLocked: string
  emailMfaLocked: string
  passwordResetLocked: string
  changeEmailLocked: string
  emailTaken: string
  wrongCode: string
  requireNewPassword: string
  emailAlreadyVerified: string
  requireNewEmail: string
  uniqueAttributeAlreadyExists: string
  isNotEmail: string
  isWeakPassword: string
}

interface ErrorCodes {
  NoUser: string
  UserDisabled: string
  AccountLocked: string
  OtpMfaLocked: string
  SmsMfaLocked: string
  EmailMfaLocked: string
  PasswordResetLocked: string
  ChangeEmailLocked: string
  EmailTaken: string
  WrongCode: string
  RequireDifferentPassword: string
  EmailAlreadyVerified: string
  RequireDifferentEmail: string
  WrongMfaCode: string
  WrongAuthCode: string
}

const errorCodes: ErrorCodes = {
  NoUser: 'NoUser',
  UserDisabled: 'UserDisabled',
  AccountLocked: 'AccountLocked',
  OtpMfaLocked: 'OtpMfaLocked',
  SmsMfaLocked: 'SmsMfaLocked',
  EmailMfaLocked: 'EmailMfaLocked',
  PasswordResetLocked: 'PasswordResetLocked',
  ChangeEmailLocked: 'ChangeEmailLocked',
  EmailTaken: 'EmailTaken',
  WrongCode: 'WrongCode',
  RequireDifferentPassword: 'RequireDifferentPassword',
  EmailAlreadyVerified: 'EmailAlreadyVerified',
  RequireDifferentEmail: 'RequireDifferentEmail',
  WrongMfaCode: 'WrongMfaCode',
  WrongAuthCode: 'WrongAuthCode',
}

function getRequestErrorMessages(locale: Locale): RequestErrorMessages {
  const messages: Record<Locale, RequestErrorMessages> = {
    en: {
      authFailed: 'Authentication Failed.',
      noUser: 'No user found.',
      disabledUser: 'This account has been disabled.',
      accountLocked: 'Account temporarily locked due to excessive login failures.',
      optMfaLocked: 'Too many failed OTP verification attempts. Please try again after 30 minutes.',
      smsMfaLocked: 'Too many SMS verification attempts. Please try again after 30 minutes.',
      emailMfaLocked: 'Too many email verification attempts. Please try again after 30 minutes.',
      passwordResetLocked: 'Too many password reset requests. Please try again tomorrow.',
      changeEmailLocked: 'Too many send email change code requests. Please try again after 30 minutes.',
      emailTaken: 'The email address is already in use.',
      wrongCode: 'Invalid code.',
      requireNewPassword: 'Your new password can not be same as old password.',
      emailAlreadyVerified: 'The email address is already verified.',
      requireNewEmail: 'Your new email can not be same as old email.',
      uniqueAttributeAlreadyExists: 'Duplicate value "{{attributeValue}}" for attribute "{{attributeName}}".',
      isNotEmail: 'Wrong email format.',
      isWeakPassword: 'Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
    pt: {
      authFailed: 'Falha na autenticacao.',
      noUser: 'Nenhum usuario encontrado.',
      disabledUser: 'Esta conta foi desativada.',
      accountLocked: 'Conta temporariamente bloqueada devido a muitas tentativas de login falhas.',
      optMfaLocked: 'Muitas tentativas de verificacao OTP falhas. Por favor, tente novamente apos 30 minutos.',
      smsMfaLocked: 'Muitas tentativas de verificacao por SMS. Por favor, tente novamente apos 30 minutos.',
      emailMfaLocked: 'Muitas tentativas de verificacao por e-mail. Por favor, tente novamente apos 30 minutos.',
      passwordResetLocked: 'Muitas solicitacoes de redefinicao de senha. Por favor, tente novamente amanha.',
      changeEmailLocked: 'Muitas solicitacoes de codigo de alteracao de e-mail. Por favor, tente novamente apos 30 minutos.',
      emailTaken: 'O endereco de e-mail ja esta em uso.',
      wrongCode: 'Codigo invalido.',
      requireNewPassword: 'Sua nova senha nao pode ser igual a senha antiga.',
      emailAlreadyVerified: 'O endereco de e-mail ja foi verificado.',
      requireNewEmail: 'Seu novo e-mail nao pode ser igual ao e-mail antigo.',
      uniqueAttributeAlreadyExists: 'Valor duplicado "{{attributeValue}}" para o atributo "{{attributeName}}".',
      isNotEmail: 'Formato de e-mail invalido.',
      isWeakPassword: 'A senha deve ter pelo menos 8 caracteres, conter pelo menos uma letra maiuscula, uma minuscula, um numero e um caractere especial.',
    },
    fr: {
      authFailed: 'Echec de l\'authentification.',
      noUser: 'Aucun utilisateur trouve.',
      disabledUser: 'Ce compte a ete desactive.',
      accountLocked: 'Compte temporairement bloque en raison de trop nombreuses tentatives de connexion echouees.',
      optMfaLocked: 'Nombre trop eleve de tentatives echouees de verification OTP. Veuillez reessayer dans 30 minutes.',
      smsMfaLocked: 'Trop de tentatives de verification par SMS. Veuillez reessayer dans 30 minutes.',
      emailMfaLocked: 'Trop de tentatives de verification par email. Veuillez reessayer dans 30 minutes.',
      passwordResetLocked: 'Trop de demandes de reinitialisation de mot de passe. Veuillez reessayer demain.',
      changeEmailLocked: 'Trop de demandes de modification de code de changement d\'adresse e-mail. Veuillez reessayer dans 30 minutes.',
      emailTaken: 'Cette adresse e-mail est deja utilisee.',
      wrongCode: 'Code invalide.',
      requireNewPassword: 'Votre nouveau mot de passe ne peut pas etre identique a l\'ancien mot de passe.',
      emailAlreadyVerified: 'L\'adresse e-mail est deja verifiee.',
      requireNewEmail: 'Votre nouvelle adresse e-mail ne peut pas etre identique a l\'ancienne adresse e-mail.',
      uniqueAttributeAlreadyExists: 'Valeur dupliquee "{{attributeValue}}" pour l\'attribut "{{attributeName}}".',
      isNotEmail: 'Format d\'e-mail incorrect.',
      isWeakPassword: 'Le mot de passe doit contenir au moins 8 caracteres, une majuscule, une minuscule, un chiffre et un caractere special.',
    },
  }
  return messages[locale]
}

export function useSubmitError() {
  const { locale } = useI18n()
  const authStore = useAuthStore()
  const submitError = ref<string | null>(null)

  const handleSubmitError = (error: unknown) => {
    if (error === null) {
      submitError.value = null
      authStore.setSubmitError(null)
      return
    }

    const errorString = String(error)
    const messages = getRequestErrorMessages(locale.value as Locale)
    let msg = messages.authFailed

    if (errorString.indexOf('isEmail') !== -1 || errorString === messages.isNotEmail) {
      msg = messages.isNotEmail
    } else if (errorString.indexOf('isStrongPassword') !== -1) {
      msg = messages.isWeakPassword
    } else if (errorString.indexOf(errorCodes.NoUser) !== -1) {
      msg = messages.noUser
    } else if (errorString.indexOf(errorCodes.UserDisabled) !== -1) {
      msg = messages.disabledUser
    } else if (errorString.indexOf(errorCodes.AccountLocked) !== -1) {
      msg = messages.accountLocked
    } else if (errorString.indexOf(errorCodes.OtpMfaLocked) !== -1) {
      msg = messages.optMfaLocked
    } else if (errorString.indexOf(errorCodes.SmsMfaLocked) !== -1) {
      msg = messages.smsMfaLocked
    } else if (errorString.indexOf(errorCodes.EmailMfaLocked) !== -1) {
      msg = messages.emailMfaLocked
    } else if (errorString.indexOf(errorCodes.PasswordResetLocked) !== -1) {
      msg = messages.passwordResetLocked
    } else if (errorString.indexOf(errorCodes.ChangeEmailLocked) !== -1) {
      msg = messages.changeEmailLocked
    } else if (errorString.indexOf(errorCodes.EmailTaken) !== -1) {
      msg = messages.emailTaken
    } else if (errorString.indexOf(errorCodes.WrongCode) !== -1) {
      msg = messages.wrongCode
    } else if (errorString.indexOf(errorCodes.RequireDifferentPassword) !== -1) {
      msg = messages.requireNewPassword
    } else if (errorString.indexOf(errorCodes.EmailAlreadyVerified) !== -1) {
      msg = messages.emailAlreadyVerified
    } else if (errorString.indexOf(errorCodes.RequireDifferentEmail) !== -1) {
      msg = messages.requireNewEmail
    } else if (errorString.indexOf(errorCodes.WrongMfaCode) !== -1) {
      msg = messages.wrongCode
    } else if (errorString.indexOf('Duplicate value') !== -1) {
      const valueMatch = errorString.match(/Duplicate value "([^"]+)"/)
      const attributeMatch = errorString.match(/for attribute "([^"]+)"/)

      if (valueMatch && attributeMatch) {
        const attributeValue = valueMatch[1]
        const attributeName = attributeMatch[1]
        msg = messages.uniqueAttributeAlreadyExists
          .replace('{{attributeValue}}', attributeValue)
          .replace('{{attributeName}}', attributeName)
      } else {
        msg = errorString
      }
    } else if (errorString.indexOf(errorCodes.WrongAuthCode) !== -1) {
      const currentUrl = new URL(window.location.href)
      const newUrl = new URL(`${window.location.origin}${IdentityRoute.AuthCodeExpiredView}`)
      newUrl.searchParams.set('locale', locale.value)
      newUrl.searchParams.set('redirect_uri', currentUrl.searchParams.get('redirect_uri') ?? '')
      window.history.pushState({}, '', newUrl)
      authStore.setCurrentView(View.AuthCodeExpired)
    }

    submitError.value = msg
    authStore.setSubmitError(msg)
  }

  const clearError = () => {
    submitError.value = null
    authStore.setSubmitError(null)
  }

  const getSubmitError = (error: unknown): string => {
    if (error === null) {
      return ''
    }

    const errorString = error instanceof Error ? error.message : String(error)
    const messages = getRequestErrorMessages(locale.value as Locale)
    let msg = messages.authFailed

    if (errorString.indexOf('isEmail') !== -1 || errorString === messages.isNotEmail) {
      msg = messages.isNotEmail
    } else if (errorString.indexOf('isStrongPassword') !== -1) {
      msg = messages.isWeakPassword
    } else if (errorString.indexOf(errorCodes.NoUser) !== -1) {
      msg = messages.noUser
    } else if (errorString.indexOf(errorCodes.UserDisabled) !== -1) {
      msg = messages.disabledUser
    } else if (errorString.indexOf(errorCodes.AccountLocked) !== -1) {
      msg = messages.accountLocked
    } else if (errorString.indexOf(errorCodes.OtpMfaLocked) !== -1) {
      msg = messages.optMfaLocked
    } else if (errorString.indexOf(errorCodes.SmsMfaLocked) !== -1) {
      msg = messages.smsMfaLocked
    } else if (errorString.indexOf(errorCodes.EmailMfaLocked) !== -1) {
      msg = messages.emailMfaLocked
    } else if (errorString.indexOf(errorCodes.PasswordResetLocked) !== -1) {
      msg = messages.passwordResetLocked
    } else if (errorString.indexOf(errorCodes.ChangeEmailLocked) !== -1) {
      msg = messages.changeEmailLocked
    } else if (errorString.indexOf(errorCodes.EmailTaken) !== -1) {
      msg = messages.emailTaken
    } else if (errorString.indexOf(errorCodes.WrongCode) !== -1) {
      msg = messages.wrongCode
    } else if (errorString.indexOf(errorCodes.RequireDifferentPassword) !== -1) {
      msg = messages.requireNewPassword
    } else if (errorString.indexOf(errorCodes.EmailAlreadyVerified) !== -1) {
      msg = messages.emailAlreadyVerified
    } else if (errorString.indexOf(errorCodes.RequireDifferentEmail) !== -1) {
      msg = messages.requireNewEmail
    } else if (errorString.indexOf(errorCodes.WrongMfaCode) !== -1) {
      msg = messages.wrongCode
    } else if (errorString.indexOf('Duplicate value') !== -1) {
      const valueMatch = errorString.match(/Duplicate value "([^"]+)"/)
      const attributeMatch = errorString.match(/for attribute "([^"]+)"/)

      if (valueMatch && attributeMatch) {
        const attributeValue = valueMatch[1]
        const attributeName = attributeMatch[1]
        msg = messages.uniqueAttributeAlreadyExists
          .replace('{{attributeValue}}', attributeValue)
          .replace('{{attributeName}}', attributeName)
      } else {
        msg = errorString
      }
    } else if (errorString.indexOf(errorCodes.WrongAuthCode) !== -1) {
      const currentUrl = new URL(window.location.href)
      const newUrl = new URL(`${window.location.origin}${IdentityRoute.AuthCodeExpiredView}`)
      newUrl.searchParams.set('locale', locale.value)
      newUrl.searchParams.set('redirect_uri', currentUrl.searchParams.get('redirect_uri') ?? '')
      window.history.pushState({}, '', newUrl)
      authStore.setCurrentView(View.AuthCodeExpired)
    }

    return msg
  }

  return {
    submitError,
    handleSubmitError,
    clearError,
    getSubmitError,
  }
}
