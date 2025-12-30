import { systemConfig } from './variable'

export const common = Object.freeze({
  documentTitle: {
    en: systemConfig.name,
    fr: systemConfig.name,
    zh: systemConfig.name,
    'pt': systemConfig.name,
  },
  poweredBy: {
    en: 'Powered by',
    fr: 'Propulsé par',
    zh: '技术支持',
    'pt': 'Desenvolvido por',
  },
})

export const emailVerificationEmail = Object.freeze({
  subject: {
    en: `Welcome to ${systemConfig.name}! Please verify your email address`,
    fr: `Bienvenue sur ${systemConfig.name} ! Veuillez vérifier votre adresse e-mail`,
    zh: `欢迎使用 ${systemConfig.name}！请验证您的邮箱地址`,
    'pt': `Bem-vindo ao ${systemConfig.name}! Por favor, verifique seu endereço de e-mail`,
  },
  title: {
    en: `Welcome to ${systemConfig.name}`,
    fr: `Bienvenue sur ${systemConfig.name}`,
    zh: `欢迎使用 ${systemConfig.name}`,
    'pt': `Bem-vindo ao ${systemConfig.name}`,
  },
  desc: {
    en: 'Thanks for signing up! Please verify your email address with us, your verification code is',
    fr: 'Merci de vous être inscrit ! Veuillez vérifier votre adresse e-mail. Votre code de vérification est :',
    zh: '感谢您的注册！请使用以下验证码验证您的邮箱地址：',
    'pt': 'Obrigado por se cadastrar! Por favor, verifique seu endereço de e-mail. Seu código de verificação é',
  },
  expiry: {
    en: 'This link will expire after {{expiresIn}} hours',
    fr: 'Ce lien expirera après {{expiresIn}} heures',
    zh: '此链接将在 {{expiresIn}} 小时后过期',
    'pt': 'Este link expirará após {{expiresIn}} horas',
  },
  verify: {
    en: 'Verify your email',
    fr: 'Vérifiez votre e-mail',
    zh: '验证您的邮箱',
    'pt': 'Verificar seu e-mail',
  },
})

export const welcomeEmail = Object.freeze({
  subject: {
    en: `Welcome to ${systemConfig.name}!`,
    fr: `Bienvenue sur ${systemConfig.name} !`,
    zh: `欢迎使用 ${systemConfig.name}！`,
    'pt': `Bem-vindo ao ${systemConfig.name}!`,
  },
  title: {
    en: `Welcome to ${systemConfig.name}!`,
    fr: `Bienvenue sur ${systemConfig.name} !`,
    zh: `欢迎使用 ${systemConfig.name}！`,
    'pt': `Bem-vindo ao ${systemConfig.name}!`,
  },
  desc: {
    en: 'You can now sign in to your account using your email address and password.',
    fr: 'Vous pouvez maintenant vous connecter à votre compte en utilisant votre adresse e-mail et votre mot de passe.',
    zh: '您现在可以使用您的邮箱地址和密码登录您的账户。',
    'pt': 'Agora você pode entrar na sua conta usando seu endereço de e-mail e senha.',
  },
})

export const passwordResetEmail = Object.freeze({
  subject: {
    en: 'Reset your password',
    fr: 'Réinitialisez votre mot de passe',
    zh: '重置您的密码',
    'pt': 'Redefinir sua senha',
  },
  title: {
    en: 'Reset your password',
    fr: 'Réinitialisez votre mot de passe',
    zh: '重置您的密码',
    'pt': 'Redefinir sua senha',
  },
  desc: {
    en: 'Here is your reset code, this code will be expired after {{expiresIn}} hours',
    fr: 'Voici votre code de réinitialisation. Ce code expirera après {{expiresIn}} heures.',
    zh: '这是您的重置码，将在 {{expiresIn}} 小时后过期',
    'pt': 'Aqui está seu código de redefinição. Este código expirará após {{expiresIn}} horas',
  },
})

export const changeEmailVerificationEmail = Object.freeze({
  subject: {
    en: 'Verify your email',
    fr: 'Vérifiez votre adresse e-mail',
    zh: '验证您的邮箱',
    'pt': 'Verifique seu e-mail',
  },
  title: {
    en: 'Verify your email',
    fr: 'Vérifiez votre adresse e-mail',
    zh: '验证您的邮箱',
    'pt': 'Verifique seu e-mail',
  },
  desc: {
    en: 'Here is your verification code, this code will be expired after {{expiresIn}} hours',
    fr: 'Voici votre code de vérification, ce code expirera après {{expiresIn}} heures',
    zh: '这是您的验证码，将在 {{expiresIn}} 小时后过期',
    'pt': 'Aqui está seu código de verificação. Este código expirará após {{expiresIn}} horas',
  },
})

export const emailMfaEmail = Object.freeze({
  subject: {
    en: 'Account verification code',
    fr: 'Code de vérification du compte',
    zh: '账户验证码',
    'pt': 'Código de verificação da conta',
  },
  title: {
    en: 'Account verification code',
    fr: 'Code de vérification du compte',
    zh: '账户验证码',
    'pt': 'Código de verificação da conta',
  },
  desc: {
    en: 'Here is your MFA code, this code will be expired after {{expiresIn}} minutes',
    fr: 'Voici votre code MFA. Ce code expirera après {{expiresIn}} minutes.',
    zh: '这是您的验证码，将在 {{expiresIn}} 分钟内过期',
    'pt': 'Aqui está seu código MFA. Este código expirará após {{expiresIn}} minutos',
  },
})

export const smsMfaMsg = Object.freeze({
  body: {
    en: 'Your verification code is',
    fr: 'Votre code de vérification est',
    zh: '您的验证码是',
    'pt': 'Seu código de verificação é',
  },
})
