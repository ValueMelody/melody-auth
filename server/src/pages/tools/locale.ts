import { variableConfig } from 'configs'

export const authCodeExpired = Object.freeze({
  msg: {
    en: 'Your login state has expired. Please try initializing authentication again.',
    fr: 'Votre état de connexion a expiré. Veuillez réessayer d’initialiser l’authentification.',
    zh: '您的登录状态已过期。请重新初始化认证。',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Rediriger en arrière',
    zh: '返回',
  },
})

export const changeEmail = Object.freeze({
  success: {
    en: 'Email updated!',
    fr: 'Adresse e-mail mise à jour !',
    zh: '邮箱地址已更新！',
  },
  title: {
    en: 'Change your email',
    fr: 'Changer votre adresse e-mail',
    zh: '更改您的邮箱',
  },
  email: {
    en: 'Email Address',
    fr: 'Adresse e-mail',
    zh: '邮箱地址',
  },
  confirm: {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Retourner en arrière',
    zh: '返回',
  },
  sendCode: {
    en: 'Send Verification Code',
    fr: 'Envoyer le code de vérification',
    zh: '发送验证码',
  },
  code: {
    en: 'Verification Code',
    fr: 'Code de vérification',
    zh: '验证码',
  },
  resend: {
    en: 'Resend a new code',
    fr: 'Renvoyer un nouveau code',
    zh: '重新发送验证码',
  },
  resent: {
    en: 'New code sent.',
    fr: 'Nouveau code envoyé.',
    zh: '新验证码已发送。',
  },
})

export const changePassword = Object.freeze({
  title: {
    en: 'Update your password',
    fr: 'Mettez à jour votre mot de passe',
    zh: '更新您的密码',
  },
  success: {
    en: 'Password updated!',
    fr: 'Mot de passe mis à jour !',
    zh: '密码已更新！',
  },
  newPassword: {
    en: 'New Password',
    fr: 'Nouveau mot de passe',
    zh: '新密码',
  },
  confirmNewPassword: {
    en: 'Confirm New Password',
    fr: 'Confirmez le nouveau mot de passe',
    zh: '确认新密码',
  },
  confirm: {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Rediriger en arrière',
    zh: '返回',
  },
})

export const consent = Object.freeze({
  title: {
    en: 'Authorize App',
    fr: "Autoriser l'application",
    zh: '授权应用',
  },
  requestAccess: {
    en: 'is requesting access to your account.',
    fr: "demande l'accès à votre compte.",
    zh: '请求访问您的账户。',
  },
  accept: {
    en: 'Accept',
    fr: 'Accepter',
    zh: '接受',
  },
  decline: {
    en: 'Decline',
    fr: 'Refuser',
    zh: '拒绝',
  },
})

export const emailMfa = Object.freeze({
  title: {
    en: 'A verification code has been sent to your email.',
    fr: 'Un code de vérification a été envoyé à votre adresse e-mail.',
    zh: '验证码已发送到您的邮箱。',
  },
  verify: {
    en: 'Verify',
    fr: 'Vérifier',
    zh: '验证',
  },
  code: {
    en: 'Enter your verification code here',
    fr: 'Entrez votre code de vérification ici',
    zh: '在此输入您的验证码',
  },
  resend: {
    en: 'Resend a new code',
    fr: 'Renvoyer un nouveau code',
    zh: '重新发送验证码',
  },
  resent: {
    en: 'New code sent.',
    fr: 'Nouveau code envoyé.',
    zh: '新验证码已发送。',
  },
  rememberDevice: {
    en: 'Remember this device for 30 days.',
    fr: 'Se souvenir de ce dispositif pour 30 jours.',
    zh: '记住此设备30天。',
  },
})

export const layout = Object.freeze({
  poweredByAuth: {
    en: `Powered by ${variableConfig.systemConfig.name}`,
    fr: `Propulsé par ${variableConfig.systemConfig.name}`,
    zh: `由 ${variableConfig.systemConfig.name} 提供支持`,
  },
})

export const managePasskey = Object.freeze({
  title: {
    en: 'Manage Passkey',
    fr: 'Gérer Passkey',
    zh: '管理 Passkey',
  },
  active: {
    en: 'Active Key',
    fr: 'Clé active',
    zh: '当前Passkey',
  },
  loginCount: {
    en: 'Login count',
    fr: 'Compteur de connexion',
    zh: '登录次数',
  },
  remove: {
    en: 'Remove',
    fr: 'Supprimer',
    zh: '删除',
  },
  enroll: {
    en: 'Enroll',
    fr: 'Enregistrer',
    zh: '注册',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Rediriger en arrière',
    zh: '返回',
  },
  removeSuccess: {
    en: 'Passkey removed!',
    fr: 'Passkey supprimé !',
    zh: 'Passkey 已删除！',
  },
  noPasskey: {
    en: 'No passkey found',
    fr: 'Aucun Passkey trouvé',
    zh: '未找到 Passkey',
  },
  enrollSuccess: {
    en: 'Passkey enrolled!',
    fr: 'Passkey enregistré !',
    zh: 'Passkey 已注册！',
  },
})

export const manageRecoveryCode = Object.freeze({
  title: {
    en: 'Regenerate Recovery Code',
    fr: 'Régénérer le code de récupération',
    zh: '重新生成恢复码',
  },
  desc: {
    en: 'Your current recovery code will be replaced with a new one.',
    fr: 'Votre code de récupération actuel sera remplacé par un nouveau.',
    zh: '您的当前恢复码将被替换。',
  },
  success: {
    en: 'Recovery code regenerated! Please keep a copy of this code in a safe place.',
    fr: 'Code de récupération régénéré ! Veuillez garder une copie de ce code dans un endroit sécurisé.',
    zh: '恢复码已重新生成！请将此代码安全地保存在一个安全的地方。',
  },
  regenerate: {
    en: 'Regenerate',
    fr: 'Régénérer',
    zh: '重新生成',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Rediriger en arrière',
    zh: '返回',
  },
  copy: {
    en: 'Copy',
    fr: 'Copier',
    zh: '复制',
  },
  download: {
    en: 'Download',
    fr: 'Télécharger',
    zh: '下载',
  },
})

export const mfaEnroll = Object.freeze({
  title: {
    en: 'Select one of the MFA type',
    fr: 'Sélectionnez un type de MFA',
    zh: '选择一种多重验证类型',
  },
  email: {
    en: 'Email',
    fr: 'E-mail',
    zh: '邮箱',
  },
  otp: {
    en: 'Authenticator',
    fr: 'Authentificateur',
    zh: '验证器APP',
  },
  sms: {
    en: 'SMS',
    fr: 'message texte',
    zh: '短信',
  },
})

export const otpMfa = Object.freeze({
  setup: {
    en: 'Use your authenticator app to scan the image below:',
    fr: "Utilisez votre application d'authentification pour scanner l'image ci-dessous :",
    zh: '使用您的验证器APP扫描以下二维码：',
  },
  manual: {
    en: 'Unable to scan?',
    fr: 'Impossible de scanner ?',
    zh: '无法扫描？',
  },
  yourKey: {
    en: 'Use the following setup key to manually configure your authenticator app.',
    fr: 'Utilisez le code suivant pour configurer manuellement votre application d\'authentification.',
    zh: '使用以下设置密钥手动配置您的验证器APP。',
  },
  code: {
    en: 'Enter the code generated by your authenticator app',
    fr: "Entrez le code généré par votre application d'authentification",
    zh: '输入您的验证器APP生成的代码',
  },
  verify: {
    en: 'Verify',
    fr: 'Vérifier',
    zh: '验证',
  },
  switchToEmail: {
    en: 'Receive MFA Code by Email',
    fr: 'Recevoir le code MFA par e-mail',
    zh: '通过邮箱接收验证码',
  },
  rememberDevice: {
    en: 'Remember this device for 30 days.',
    fr: 'Se souvenir de ce dispositif pour 30 jours.',
    zh: '记住此设备30天。',
  },
})

export const passkeyEnroll = Object.freeze({
  title: {
    en: 'Enroll Passkey for a faster and more secure login process',
    fr: 'Enregistrer Passkey pour un processus de connexion plus rapide et plus sécurisé',
    zh: '注册 Passkey 以实现更快速、更安全的登录过程',
  },
  enroll: {
    en: 'Enroll',
    fr: 'Enregistrer',
    zh: '注册',
  },
  skip: {
    en: 'Skip',
    fr: 'Passer',
    zh: '跳过',
  },
  rememberSkip: {
    en: 'Do not ask again',
    fr: 'Ne pas demander à nouveau',
    zh: '不再询问',
  },
})

export const recoveryCodeEnroll = Object.freeze({
  title: {
    en: 'Recovery Code',
    fr: 'Code de récupération',
    zh: '恢复码',
  },
  desc: {
    en: 'Keep a copy of this code in a safe place. It can be used to recover your account if you forget your password.',
    fr: 'Gardez une copie de ce code dans un endroit sécurisé. Il peut être utilisé pour récupérer votre compte si vous oubliez votre mot de passe.',
    zh: '将此代码安全地保存在一个安全的地方。它可以在您忘记密码时用于恢复您的账户。',
  },
  copy: {
    en: 'Copy',
    fr: 'Copier',
    zh: '复制',
  },
  download: {
    en: 'Download',
    fr: 'Télécharger',
    zh: '下载',
  },
  continue: {
    en: 'Continue',
    fr: 'Continuer',
    zh: '继续',
  },
})

export const passwordlessCode = Object.freeze({
  title: {
    en: 'A verification code has been sent to your email.',
    fr: 'Un code de vérification a été envoyé à votre adresse e-mail.',
    zh: '验证码已发送到您的邮箱。',
  },
  verify: {
    en: 'Verify',
    fr: 'Vérifier',
    zh: '验证',
  },
  code: {
    en: 'Enter your verification code here',
    fr: 'Entrez votre code de vérification ici',
    zh: '在此输入您的验证码',
  },
  resend: {
    en: 'Resend a new code',
    fr: 'Renvoyer un nouveau code',
    zh: '重新发送验证码',
  },
  resent: {
    en: 'New code sent.',
    fr: 'Nouveau code envoyé.',
    zh: '新验证码已发送。',
  },
})

export const resetMfa = Object.freeze({
  title: {
    en: 'Reset your MFA',
    fr: 'Réinitialisez votre MFA',
    zh: '重置您的 MFA',
  },
  success: {
    en: 'Reset success!',
    fr: 'Réinitialisation réussie!',
    zh: '重置成功！',
  },
  desc: {
    en: 'Your current Multi-Factor Authentication (MFA) method will be reset. After this reset, you will need to set up MFA again to ensure continued secure access to your account.',
    fr: "Votre méthode actuelle d'authentification multifactorielle (MFA) sera réinitialisée. Après cette réinitialisation, vous devrez configurer à nouveau votre MFA pour garantir un accès sécurisé continu à votre compte.",
    zh: '您的当前多重验证方式将被重置。重置后，您需要重新设置验证方式以确保继续安全访问您的账户。',
  },
  confirm: {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Rediriger en arrière',
    zh: '返回',
  },
})

export const resetPassword = Object.freeze({
  title: {
    en: 'Reset your password',
    fr: 'Réinitialiser votre mot de passe',
    zh: '重置您的密码',
  },
  success: {
    en: 'Password reset successful!',
    fr: 'Réinitialisation du mot de passe réussie !',
    zh: '密码重置成功！',
  },
  signIn: {
    en: 'Sign in',
    fr: 'Se connecter',
    zh: '登录',
  },
  backSignIn: {
    en: 'Back to sign in',
    fr: 'Retour à la connexion',
    zh: '返回登录',
  },
  desc: {
    en: 'Enter your email address, we will send you a reset code by email',
    fr: 'Entrez votre adresse e-mail, nous vous enverrons un code de réinitialisation par e-mail.',
    zh: '输入您的邮箱地址，我们将通过邮箱发送重置码',
  },
  email: {
    en: 'Email Address',
    fr: 'Adresse e-mail',
    zh: '邮箱地址',
  },
  code: {
    en: 'Code',
    fr: 'Code',
    zh: '重置码',
  },
  password: {
    en: 'Password',
    fr: 'Mot de passe',
    zh: '密码',
  },
  confirmPassword: {
    en: 'Confirm Password',
    fr: 'Confirmer le mot de passe',
    zh: '确认密码',
  },
  send: {
    en: 'Send',
    fr: 'Envoyer',
    zh: '发送',
  },
  reset: {
    en: 'Reset',
    fr: 'Réinitialiser',
    zh: '重置',
  },
  resend: {
    en: 'Resend a new code',
    fr: 'Renvoyer un nouveau code',
    zh: '重新发送验证码',
  },
  resent: {
    en: 'New code sent.',
    fr: 'Nouveau code envoyé.',
    zh: '新验证码已发送。',
  },
})

export const signIn = Object.freeze({
  title: {
    en: 'Authentication',
    fr: 'Authentification',
    zh: '身份认证',
  },
  email: {
    en: 'Email',
    fr: 'Adresse e-mail',
    zh: '邮箱地址',
  },
  password: {
    en: 'Password',
    fr: 'Mot de passe',
    zh: '密码',
  },
  submit: {
    en: 'Login',
    fr: 'Se connecter',
    zh: '登录',
  },
  signUp: {
    en: 'Create a new account',
    fr: 'Créer un nouveau compte',
    zh: '创建新账户',
  },
  recoveryCode: {
    en: 'Having trouble logging in?',
    fr: 'Vous avez du mal à vous connecter ?',
    zh: '登录困难？',
  },
  passwordReset: {
    en: 'Reset password',
    fr: 'Réinitialiser le mot de passe',
    zh: '重置密码',
  },
  githubSignIn: {
    en: 'Log in with GitHub',
    fr: 'Se connecter avec GitHub',
    zh: '使用 GitHub 登录',
  },
  discordSignIn: {
    en: 'Log in with Discord',
    fr: 'Se connecter avec Discord',
    zh: '使用 Discord 登录',
  },
  oidcSignIn: {
    en: 'Log in with ',
    fr: 'Se connecter avec ',
    zh: '登录',
  },
  continue: {
    en: 'Continue',
    fr: 'Continuer',
    zh: '继续',
  },
  withPasskey: {
    en: 'Log in with Passkey',
    fr: 'Se connecter avec Passkey',
    zh: '使用 Passkey 登录',
  },
})

export const signUp = Object.freeze({
  title: {
    en: 'Create an account',
    fr: 'Créer un compte',
    zh: '创建账户',
  },
  email: {
    en: 'Email',
    fr: 'Adresse e-mail',
    zh: '邮箱地址',
  },
  password: {
    en: 'Password',
    fr: 'Mot de passe',
    zh: '密码',
  },
  confirmPassword: {
    en: 'Confirm Password',
    fr: 'Confirmer le mot de passe',
    zh: '确认密码',
  },
  firstName: {
    en: 'First Name',
    fr: 'Prénom',
    zh: '名',
  },
  lastName: {
    en: 'Last Name',
    fr: 'Nom',
    zh: '姓',
  },
  signUp: {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
  },
  signIn: {
    en: 'Already have an account? Sign in',
    fr: 'Vous avez déjà un compte ? Connectez-vous.',
    zh: '已有账户？登录',
  },
  bySignUp: {
    en: 'By signing up, you agree to our',
    fr: 'En vous inscrivant, vous acceptez nos',
    zh: '通过注册，您同意我们的',
  },
  linkConnect: {
    en: 'and',
    fr: 'et',
    zh: '和',
  },
  terms: {
    en: 'Terms of Service',
    fr: 'Conditions d’utilisation',
    zh: '服务条款',
  },
  privacyPolicy: {
    en: 'Privacy Policy',
    fr: 'Politique de confidentialité',
    zh: '隐私政策',
  },
})

export const recoveryCodeSignIn = Object.freeze({
  title: {
    en: 'Use your recovery code',
    fr: 'Utilisez votre code de récupération',
    zh: '使用恢复码',
  },
  signIn: {
    en: 'Back to sign in',
    fr: 'Retour à la connexion',
    zh: '返回登录',
  },
  email: {
    en: 'Email',
    fr: 'Adresse e-mail',
    zh: '邮箱地址',
  },
  recoveryCode: {
    en: 'Recovery Code',
    fr: 'Code de récupération',
    zh: '恢复码',
  },
  confirm: {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
  },
})

export const smsMfa = Object.freeze({
  title: {
    en: 'SMS Verification',
    fr: 'Vérification par SMS',
    zh: '短信验证',
  },
  phoneNumber: {
    en: 'Phone Number',
    fr: 'Numéro de téléphone',
    zh: '手机号',
  },
  code: {
    en: 'Verification Code',
    fr: 'Code de vérification',
    zh: '验证码',
  },
  sendCode: {
    en: 'Send code',
    fr: 'Envoyer le code',
    zh: '发送验证码',
  },
  verify: {
    en: 'Verify',
    fr: 'Vérifier',
    zh: '验证',
  },
  resend: {
    en: 'Resend a new code',
    fr: 'Renvoyer un nouveau code',
    zh: '重新发送验证码',
  },
  resent: {
    en: 'New code sent.',
    fr: 'Nouveau code envoyé.',
    zh: '新验证码已发送。',
  },
  switchToEmail: {
    en: 'Receive MFA Code by Email',
    fr: 'Recevoir le code MFA par e-mail',
    zh: '通过邮箱接收验证码',
  },
  rememberDevice: {
    en: 'Remember this device for 30 days.',
    fr: 'Se souvenir de ce dispositif pour 30 jours.',
    zh: '记住此设备30天。',
  },
})

export const updateInfo = Object.freeze({
  title: {
    en: 'Update your info',
    fr: 'Mettre à jour vos informations',
    zh: '更新您的信息',
  },
  firstName: {
    en: 'First Name',
    fr: 'Prénom',
    zh: '名',
  },
  lastName: {
    en: 'Last Name',
    fr: 'Nom',
    zh: '姓',
  },
  success: {
    en: 'Info updated!',
    fr: 'Informations mises à jour !',
    zh: '信息已更新！',
  },
  confirm: {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Rediriger en arrière',
    zh: '返回',
  },
})

export const verifyEmail = Object.freeze({
  title: {
    en: 'Verify your email',
    fr: 'Vérifiez votre e-mail',
    zh: '验证您的邮箱',
  },
  desc: {
    en: 'Enter your verification code received by email',
    fr: 'Entrez le code de vérification reçu par e-mail',
    zh: '输入您通过邮箱收到的验证码',
  },
  verify: {
    en: 'Verify',
    fr: 'Vérifier',
    zh: '验证',
  },
  success: {
    en: 'Verification successful! You can close this page now.',
    fr: 'Vérification réussie ! Vous pouvez fermer cette page maintenant.',
    zh: '验证成功！您可以关闭此页面了。',
  },
})

export const switchOrg = Object.freeze({
  title: {
    en: 'Switch Organization',
    fr: 'Changer d\'organisation',
    zh: '切换组织',
  },
  confirm: {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
  },
  success: {
    en: 'Organization changed successfully!',
    fr: 'Organisation changée avec succès !',
    zh: '组织切换成功！',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Rediriger en arrière',
    zh: '返回',
  },
})

export const requestError = Object.freeze({
  authFailed: {
    en: 'Authentication Failed.',
    fr: "Échec de l'authentification.",
    zh: '身份认证失败。',
  },
  noUser: {
    en: 'No user found.',
    fr: 'Aucun utilisateur trouvé.',
    zh: '未找到用户。',
  },
  disabledUser: {
    en: 'This account has been disabled.',
    fr: 'Ce compte a été désactivé.',
    zh: '此账户已被禁用。',
  },
  accountLocked: {
    en: 'Account temporarily locked due to excessive login failures.',
    fr: 'Compte temporairement bloqué en raison de trop nombreuses tentatives de connexion échouées.',
    zh: '由于登录失败次数过多，账户暂时被锁定。',
  },
  requireNewPassword: {
    en: 'Your new password can not be same as old password.',
    fr: "Votre nouveau mot de passe ne peut pas être identique à l'ancien mot de passe.",
    zh: '您的密码不能与旧密码相同。',
  },
  requireNewEmail: {
    en: 'Your new email can not be same as old email.',
    fr: "Votre nouvelle adresse e-mail ne peut pas être identique à l'ancienne adresse e-mail.",
    zh: '您的邮箱不能与旧邮箱相同。',
  },
  emailAlreadyVerified: {
    en: 'The email address is already verified.',
    fr: 'L\'adresse e-mail est déjà vérifiée.',
    zh: '邮箱地址已验证。',
  },
  optMfaLocked: {
    en: 'Too many failed OTP verification attempts. Please try again after 30 minutes.',
    fr: 'Nombre trop élevé de tentatives échouées de vérification OTP. Veuillez réessayer dans 30 minutes.',
    zh: '验证失败次数过多。请在 30 分钟后重试。',
  },
  smsMfaLocked: {
    en: 'Too many SMS verification attempts. Please try again after 30 minutes.',
    fr: 'Trop de tentatives de vérification par SMS. Veuillez réessayer dans 30 minutes.',
    zh: '短信验证失败次数过多。请在 30 分钟后重试。',
  },
  emailMfaLocked: {
    en: 'Too many email verification attempts. Please try again after 30 minutes.',
    fr: 'Trop de tentatives de vérification par email. Veuillez réessayer dans 30 minutes.',
    zh: '邮箱验证失败次数过多。请在 30 分钟后重试。',
  },
  passwordResetLocked: {
    en: 'Too many password reset requests. Please try again tomorrow.',
    fr: 'Trop de demandes de réinitialisation de mot de passe. Veuillez réessayer demain.',
    zh: '重置密码请求次数过多。请明天再试。',
  },
  changeEmailLocked: {
    en: 'Too many send email change code requests. Please try again after 30 minutes.',
    fr: 'Trop de demandes de modification de code de changement d\'adresse e-mail. Veuillez réessayer dans 30 minutes.',
    zh: '发送邮箱验证码请求次数过多。请在 30 分钟后重试。',
  },
  emailTaken: {
    en: 'The email address is already in use.',
    fr: 'Cette adresse e-mail est déjà utilisée.',
    zh: '邮箱地址已被使用。',
  },
  wrongCode: {
    en: 'Invalid code.',
    fr: 'Code invalide.',
    zh: '无效的验证码。',
  },
  validationAttributeFailed: {
    en: 'Value for attribute "{{attributeName}}" does not match the validation rule.',
    fr: 'La valeur pour l\'attribut "{{attributeName}}" ne correspond pas à la règle de validation.',
    zh: '属性 "{{attributeName}}" 的值不符合验证规则。',
  },
  uniqueAttributeAlreadyExists: {
    en: 'Duplicate value "{{attributeValue}}" for attribute "{{attributeName}}".',
    fr: 'Valeur dupliquée "{{attributeValue}}" pour l\'attribut "{{attributeName}}".',
    zh: '已存在其他用户使用 "{{attributeValue}}" 作为 "{{attributeName}}"的值。',
  },
})

export const validateError = Object.freeze({
  passwordIsRequired: {
    en: 'Password is required!',
    fr: 'Le mot de passe est requis !',
    zh: '密码是必填项！',
  },
  fieldIsRequired: {
    en: 'This field is required!',
    fr: 'Ce champ est requis !',
    zh: '此字段是必填项！',
  },
  passwordFormat: {
    en: 'Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    fr: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
    zh: '密码必须至少包含 8 个字符，至少包含一个大写字母、一个小写字母、一个数字和一个特殊字符。',
  },
  phoneNumberIsRequired: {
    en: 'Phone number is required!',
    fr: 'Le numéro de téléphone est requis !',
    zh: '手机号是必填项！',
  },
  wrongPhoneFormat: {
    en: 'the format must be a number up to fifteen digits in length starting with a ‘+’ with country code.',
    fr: 'Le format doit être un numéro de maximum quinze chiffres commençant par un ‘+’ avec l’indicatif du pays.',
    zh: '格式必须为以 ‘+’ 开头，最多十五位的数字，包含国家代码。',
  },
  emailIsRequired: {
    en: 'Email is required!',
    fr: "L'adresse e-mail est requise !",
    zh: '邮箱是必填项！',
  },
  wrongEmailFormat: {
    en: 'Wrong email format.',
    fr: "Format d'e-mail incorrect.",
    zh: '邮箱格式错误。',
  },
  isNotEmail: {
    en: 'Wrong email format.',
    fr: "Format d'e-mail incorrect.",
    zh: '邮箱格式错误。',
  },
  isWeakPassword: {
    en: 'Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    fr: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
    zh: '密码必须至少包含 8 个字符，至少包含一个大写字母、一个小写字母、一个数字和一个特殊字符。',
  },
  passwordNotMatch: {
    en: 'The password and confirm password do not match.',
    fr: 'Le mot de passe et la confirmation ne correspondent pas.',
    zh: '密码和确认密码不匹配。',
  },
  firstNameIsEmpty: {
    en: 'First name can not be empty.',
    fr: 'Le prénom ne peut pas être vide.',
    zh: '名不能为空。',
  },
  lastNameIsEmpty: {
    en: 'Last name can not be empty.',
    fr: 'Le nom de famille ne peut pas être vide.',
    zh: '姓不能为空。',
  },
  otpCodeLengthIssue: {
    en: 'OTP code can only be 6 digits numbers.',
    fr: 'Le code OTP ne peut être composé que de 6 chiffres.',
    zh: '验证码只能包含 6 位数字。',
  },
  verificationCodeLengthIssue: {
    en: 'Verification code can only be 6 characters.',
    fr: 'Le code de vérification doit contenir 6 caractères.',
    zh: '验证码只能包含 6 个字符。',
  },
})
