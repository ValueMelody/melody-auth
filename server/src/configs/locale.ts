import { systemConfig } from './variable'

export const common = Object.freeze({
  documentTitle: {
    en: systemConfig.name,
    fr: systemConfig.name,
  },
  poweredBy: {
    en: 'Powered by',
    fr: 'Propulsé par',
  },
})

export const emailVerificationEmail = Object.freeze({
  subject: {
    en: `Welcome to ${systemConfig.name}! Please verify your email address`,
    fr: `Bienvenue sur ${systemConfig.name} ! Veuillez vérifier votre adresse e-mail`,
  },
  title: {
    en: `Welcome to ${systemConfig.name}`,
    fr: `Bienvenue sur ${systemConfig.name}`,
  },
  desc: {
    en: 'Thanks for signing up! Please verify your email address with us, your verification code is',
    fr: 'Merci de vous être inscrit ! Veuillez vérifier votre adresse e-mail. Votre code de vérification est :',
  },
  expiry: {
    en: 'This link will expire after 2 hours',
    fr: 'Ce lien expirera après 2 heures',
  },
  verify: {
    en: 'Verify your email',
    fr: 'Vérifiez votre e-mail',
  },
})

export const welcomeEmail = Object.freeze({
  subject: {
    en: `Welcome to ${systemConfig.name}!`,
    fr: `Bienvenue sur ${systemConfig.name} !`,
  },
  title: {
    en: `Welcome to ${systemConfig.name}!`,
    fr: `Bienvenue sur ${systemConfig.name} !`,
  },
  desc: {
    en: 'You can now sign in to your account using your email address and password.',
    fr: 'Vous pouvez maintenant vous connecter à votre compte en utilisant votre adresse e-mail et votre mot de passe.',
  },
})

export const passwordResetEmail = Object.freeze({
  subject: {
    en: 'Reset your password',
    fr: 'Réinitialisez votre mot de passe',
  },
  title: {
    en: 'Reset your password',
    fr: 'Réinitialisez votre mot de passe',
  },
  desc: {
    en: 'Here is your reset code, this code will be expired after 2 hour',
    fr: 'Voici votre code de réinitialisation. Ce code expirera après 2 heures.',
  },
})

export const changeEmailVerificationEmail = Object.freeze({
  subject: {
    en: 'Verify your email',
    fr: 'Vérifiez votre adresse e-mail',
  },
  title: {
    en: 'Verify your email',
    fr: 'Vérifiez votre adresse e-mail',
  },
  desc: {
    en: 'Here is your verification code, this code will be expired after 2 hours',
    fr: 'Voici votre code de vérification, ce code expirera après 2 heures',
  },
})

export const emailMfaEmail = Object.freeze({
  subject: {
    en: 'Account verification code',
    fr: 'Code de vérification du compte',
  },
  title: {
    en: 'Account verification code',
    fr: 'Code de vérification du compte',
  },
  desc: {
    en: 'Here is your MFA code, this code will be expired after 5 minutes',
    fr: 'Voici votre code MFA. Ce code expirera après 5 minutes.',
  },
})

export const smsMfaMsg = Object.freeze({
  body: {
    en: 'Your verification code is',
    fr: 'Votre code de vérification est',
  },
})
