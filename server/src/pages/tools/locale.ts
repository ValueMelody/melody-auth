import { variableConfig } from 'configs'

export const authCodeExpired = Object.freeze({
  msg: {
    en: 'Your login state has expired. Please try initializing authentication again.',
    fr: 'Votre état de connexion a expiré. Veuillez réessayer d’initialiser l’authentification.',
    zh: '您的登录状态已过期。请重新初始化认证。',
    'pt': 'Seu estado de login expirou. Por favor, tente iniciar a autenticação novamente.',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Rediriger en arrière',
    zh: '返回',
    'pt': 'Voltar',
  },
})

export const changeEmail = Object.freeze({
  success: {
    en: 'Email updated!',
    fr: 'Adresse e-mail mise à jour !',
    zh: '邮箱地址已更新！',
    'pt': 'E-mail atualizado!',
  },
  title: {
    en: 'Change your email',
    fr: 'Changer votre adresse e-mail',
    zh: '更改您的邮箱',
    'pt': 'Alterar seu e-mail',
  },
  email: {
    en: 'Email Address',
    fr: 'Adresse e-mail',
    zh: '邮箱地址',
    'pt': 'Endereço de E-mail',
  },
  confirm: {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
    'pt': 'Confirmar',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Retourner en arrière',
    zh: '返回',
    'pt': 'Voltar',
  },
  sendCode: {
    en: 'Send Verification Code',
    fr: 'Envoyer le code de vérification',
    zh: '发送验证码',
    'pt': 'Enviar Código de Verificação',
  },
  code: {
    en: 'Verification Code',
    fr: 'Code de vérification',
    zh: '验证码',
    'pt': 'Código de Verificação',
  },
  resend: {
    en: 'Resend a new code',
    fr: 'Renvoyer un nouveau code',
    zh: '重新发送验证码',
    'pt': 'Reenviar novo código',
  },
  resent: {
    en: 'New code sent.',
    fr: 'Nouveau code envoyé.',
    zh: '新验证码已发送。',
    'pt': 'Novo código enviado.',
  },
})

export const changePassword = Object.freeze({
  title: {
    en: 'Update your password',
    fr: 'Mettez à jour votre mot de passe',
    zh: '更新您的密码',
    'pt': 'Atualizar sua senha',
  },
  success: {
    en: 'Password updated!',
    fr: 'Mot de passe mis à jour !',
    zh: '密码已更新！',
    'pt': 'Senha atualizada!',
  },
  newPassword: {
    en: 'New Password',
    fr: 'Nouveau mot de passe',
    zh: '新密码',
    'pt': 'Nova Senha',
  },
  confirmNewPassword: {
    en: 'Confirm New Password',
    fr: 'Confirmez le nouveau mot de passe',
    zh: '确认新密码',
    'pt': 'Confirmar Nova Senha',
  },
  confirm: {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
    'pt': 'Confirmar',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Rediriger en arrière',
    zh: '返回',
    'pt': 'Voltar',
  },
})

export const consent = Object.freeze({
  title: {
    en: 'Authorize App',
    fr: "Autoriser l'application",
    zh: '授权应用',
    'pt': 'Autorizar Aplicativo',
  },
  requestAccess: {
    en: 'is requesting access to your account.',
    fr: "demande l'accès à votre compte.",
    zh: '请求访问您的账户。',
    'pt': 'está solicitando acesso à sua conta.',
  },
  accept: {
    en: 'Accept',
    fr: 'Accepter',
    zh: '接受',
    'pt': 'Aceitar',
  },
  decline: {
    en: 'Decline',
    fr: 'Refuser',
    zh: '拒绝',
    'pt': 'Recusar',
  },
})

export const emailMfa = Object.freeze({
  title: {
    en: 'A verification code has been sent to your email.',
    fr: 'Un code de vérification a été envoyé à votre adresse e-mail.',
    zh: '验证码已发送到您的邮箱。',
    'pt': 'Um código de verificação foi enviado para seu e-mail.',
  },
  verify: {
    en: 'Verify',
    fr: 'Vérifier',
    zh: '验证',
    'pt': 'Verificar',
  },
  code: {
    en: 'Enter your verification code here',
    fr: 'Entrez votre code de vérification ici',
    zh: '在此输入您的验证码',
    'pt': 'Digite seu código de verificação aqui',
  },
  resend: {
    en: 'Resend a new code',
    fr: 'Renvoyer un nouveau code',
    zh: '重新发送验证码',
    'pt': 'Reenviar novo código',
  },
  resent: {
    en: 'New code sent.',
    fr: 'Nouveau code envoyé.',
    zh: '新验证码已发送。',
    'pt': 'Novo código enviado.',
  },
  rememberDevice: {
    en: 'Remember this device for 30 days.',
    fr: 'Se souvenir de ce dispositif pour 30 jours.',
    zh: '记住此设备30天。',
    'pt': 'Lembrar este dispositivo por 30 dias.',
  },
})

export const layout = Object.freeze({
  poweredByAuth: {
    en: `Powered by ${variableConfig.systemConfig.name}`,
    fr: `Propulsé par ${variableConfig.systemConfig.name}`,
    zh: `由 ${variableConfig.systemConfig.name} 提供支持`,
    'pt': `Desenvolvido por ${variableConfig.systemConfig.name}`,
  },
})

export const managePasskey = Object.freeze({
  title: {
    en: 'Manage Passkey',
    fr: 'Gérer Passkey',
    zh: '管理 Passkey',
    'pt': 'Gerenciar Passkey',
  },
  active: {
    en: 'Active Key',
    fr: 'Clé active',
    zh: '当前Passkey',
    'pt': 'Chave Ativa',
  },
  loginCount: {
    en: 'Login count',
    fr: 'Compteur de connexion',
    zh: '登录次数',
    'pt': 'Contagem de logins',
  },
  remove: {
    en: 'Remove',
    fr: 'Supprimer',
    zh: '删除',
    'pt': 'Remover',
  },
  enroll: {
    en: 'Enroll',
    fr: 'Enregistrer',
    zh: '注册',
    'pt': 'Cadastrar',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Rediriger en arrière',
    zh: '返回',
    'pt': 'Voltar',
  },
  removeSuccess: {
    en: 'Passkey removed!',
    fr: 'Passkey supprimé !',
    zh: 'Passkey 已删除！',
    'pt': 'Passkey removida!',
  },
  noPasskey: {
    en: 'No passkey found',
    fr: 'Aucun Passkey trouvé',
    zh: '未找到 Passkey',
    'pt': 'Nenhuma passkey encontrada',
  },
  enrollSuccess: {
    en: 'Passkey enrolled!',
    fr: 'Passkey enregistré !',
    zh: 'Passkey 已注册！',
    'pt': 'Passkey cadastrada!',
  },
})

export const manageRecoveryCode = Object.freeze({
  title: {
    en: 'Regenerate Recovery Code',
    fr: 'Régénérer le code de récupération',
    zh: '重新生成恢复码',
    'pt': 'Regenerar Código de Recuperação',
  },
  desc: {
    en: 'Your current recovery code will be replaced with a new one.',
    fr: 'Votre code de récupération actuel sera remplacé par un nouveau.',
    zh: '您的当前恢复码将被替换。',
    'pt': 'Seu código de recuperação atual será substituído por um novo.',
  },
  success: {
    en: 'Recovery code regenerated! Please keep a copy of this code in a safe place.',
    fr: 'Code de récupération régénéré ! Veuillez garder une copie de ce code dans un endroit sécurisé.',
    zh: '恢复码已重新生成！请将此代码安全地保存在一个安全的地方。',
    'pt': 'Código de recuperação regenerado! Por favor, guarde uma cópia deste código em um lugar seguro.',
  },
  regenerate: {
    en: 'Regenerate',
    fr: 'Régénérer',
    zh: '重新生成',
    'pt': 'Regenerar',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Rediriger en arrière',
    zh: '返回',
    'pt': 'Voltar',
  },
  copy: {
    en: 'Copy',
    fr: 'Copier',
    zh: '复制',
    'pt': 'Copiar',
  },
  download: {
    en: 'Download',
    fr: 'Télécharger',
    zh: '下载',
    'pt': 'Baixar',
  },
})

export const mfaEnroll = Object.freeze({
  title: {
    en: 'Select one of the MFA type',
    fr: 'Sélectionnez un type de MFA',
    zh: '选择一种多重验证类型',
    'pt': 'Selecione um tipo de MFA',
  },
  email: {
    en: 'Email',
    fr: 'E-mail',
    zh: '邮箱',
    'pt': 'E-mail',
  },
  otp: {
    en: 'Authenticator',
    fr: 'Authentificateur',
    zh: '验证器APP',
    'pt': 'Autenticador',
  },
  sms: {
    en: 'SMS',
    fr: 'message texte',
    zh: '短信',
    'pt': 'SMS',
  },
})

export const otpMfa = Object.freeze({
  setup: {
    en: 'Use your authenticator app to scan the image below:',
    fr: "Utilisez votre application d'authentification pour scanner l'image ci-dessous :",
    zh: '使用您的验证器APP扫描以下二维码：',
    'pt': 'Use seu aplicativo autenticador para escanear a imagem abaixo:',
  },
  manual: {
    en: 'Unable to scan?',
    fr: 'Impossible de scanner ?',
    zh: '无法扫描？',
    'pt': 'Não consegue escanear?',
  },
  yourKey: {
    en: 'Use the following setup key to manually configure your authenticator app.',
    fr: 'Utilisez le code suivant pour configurer manuellement votre application d\'authentification.',
    zh: '使用以下设置密钥手动配置您的验证器APP。',
    'pt': 'Use a seguinte chave de configuração para configurar manualmente seu aplicativo autenticador.',
  },
  code: {
    en: 'Enter the code generated by your authenticator app',
    fr: "Entrez le code généré par votre application d'authentification",
    zh: '输入您的验证器APP生成的代码',
    'pt': 'Digite o código gerado pelo seu aplicativo autenticador',
  },
  verify: {
    en: 'Verify',
    fr: 'Vérifier',
    zh: '验证',
    'pt': 'Verificar',
  },
  switchToEmail: {
    en: 'Receive MFA Code by Email',
    fr: 'Recevoir le code MFA par e-mail',
    zh: '通过邮箱接收验证码',
    'pt': 'Receber código MFA por e-mail',
  },
  rememberDevice: {
    en: 'Remember this device for 30 days.',
    fr: 'Se souvenir de ce dispositif pour 30 jours.',
    zh: '记住此设备30天。',
    'pt': 'Lembrar este dispositivo por 30 dias.',
  },
})

export const passkeyEnroll = Object.freeze({
  title: {
    en: 'Enroll Passkey for a faster and more secure login process',
    fr: 'Enregistrer Passkey pour un processus de connexion plus rapide et plus sécurisé',
    zh: '注册 Passkey 以实现更快速、更安全的登录过程',
    'pt': 'Cadastre uma Passkey para um processo de login mais rápido e seguro',
  },
  enroll: {
    en: 'Enroll',
    fr: 'Enregistrer',
    zh: '注册',
    'pt': 'Cadastrar',
  },
  skip: {
    en: 'Skip',
    fr: 'Passer',
    zh: '跳过',
    'pt': 'Pular',
  },
  rememberSkip: {
    en: 'Do not ask again',
    fr: 'Ne pas demander à nouveau',
    zh: '不再询问',
    'pt': 'Não perguntar novamente',
  },
})

export const recoveryCodeEnroll = Object.freeze({
  title: {
    en: 'Recovery Code',
    fr: 'Code de récupération',
    zh: '恢复码',
    'pt': 'Código de Recuperação',
  },
  desc: {
    en: 'Keep a copy of this code in a safe place. It can be used to recover your account if you forget your password.',
    fr: 'Gardez une copie de ce code dans un endroit sécurisé. Il peut être utilisé pour récupérer votre compte si vous oubliez votre mot de passe.',
    zh: '将此代码安全地保存在一个安全的地方。它可以在您忘记密码时用于恢复您的账户。',
    'pt': 'Guarde uma cópia deste código em um lugar seguro. Ele pode ser usado para recuperar sua conta se você esquecer sua senha.',
  },
  copy: {
    en: 'Copy',
    fr: 'Copier',
    zh: '复制',
    'pt': 'Copiar',
  },
  download: {
    en: 'Download',
    fr: 'Télécharger',
    zh: '下载',
    'pt': 'Baixar',
  },
  continue: {
    en: 'Continue',
    fr: 'Continuer',
    zh: '继续',
    'pt': 'Continuar',
  },
})

export const passwordlessCode = Object.freeze({
  title: {
    en: 'A verification code has been sent to your email.',
    fr: 'Un code de vérification a été envoyé à votre adresse e-mail.',
    zh: '验证码已发送到您的邮箱。',
    'pt': 'Um código de verificação foi enviado para seu e-mail.',
  },
  verify: {
    en: 'Verify',
    fr: 'Vérifier',
    zh: '验证',
    'pt': 'Verificar',
  },
  code: {
    en: 'Enter your verification code here',
    fr: 'Entrez votre code de vérification ici',
    zh: '在此输入您的验证码',
    'pt': 'Digite seu código de verificação aqui',
  },
  resend: {
    en: 'Resend a new code',
    fr: 'Renvoyer un nouveau code',
    zh: '重新发送验证码',
    'pt': 'Reenviar novo código',
  },
  resent: {
    en: 'New code sent.',
    fr: 'Nouveau code envoyé.',
    zh: '新验证码已发送。',
    'pt': 'Novo código enviado.',
  },
})

export const resetMfa = Object.freeze({
  title: {
    en: 'Reset your MFA',
    fr: 'Réinitialisez votre MFA',
    zh: '重置您的 MFA',
    'pt': 'Redefinir seu MFA',
  },
  success: {
    en: 'Reset success!',
    fr: 'Réinitialisation réussie!',
    zh: '重置成功！',
    'pt': 'Redefinição realizada com sucesso!',
  },
  desc: {
    en: 'Your current Multi-Factor Authentication (MFA) method will be reset. After this reset, you will need to set up MFA again to ensure continued secure access to your account.',
    fr: "Votre méthode actuelle d'authentification multifactorielle (MFA) sera réinitialisée. Après cette réinitialisation, vous devrez configurer à nouveau votre MFA pour garantir un accès sécurisé continu à votre compte.",
    zh: '您的当前多重验证方式将被重置。重置后，您需要重新设置验证方式以确保继续安全访问您的账户。',
    'pt': 'Seu método atual de Autenticação Multifator (MFA) será redefinido. Após esta redefinição, você precisará configurar o MFA novamente para garantir acesso seguro contínuo à sua conta.',
  },
  confirm: {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
    'pt': 'Confirmar',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Rediriger en arrière',
    zh: '返回',
    'pt': 'Voltar',
  },
})

export const resetPassword = Object.freeze({
  title: {
    en: 'Reset your password',
    fr: 'Réinitialiser votre mot de passe',
    zh: '重置您的密码',
    'pt': 'Redefinir sua senha',
  },
  success: {
    en: 'Password reset successful!',
    fr: 'Réinitialisation du mot de passe réussie !',
    zh: '密码重置成功！',
    'pt': 'Senha redefinida com sucesso!',
  },
  signIn: {
    en: 'Sign in',
    fr: 'Se connecter',
    zh: '登录',
    'pt': 'Entrar',
  },
  backSignIn: {
    en: 'Back to sign in',
    fr: 'Retour à la connexion',
    zh: '返回登录',
    'pt': 'Voltar para login',
  },
  desc: {
    en: 'Enter your email address, we will send you a reset code by email',
    fr: 'Entrez votre adresse e-mail, nous vous enverrons un code de réinitialisation par e-mail.',
    zh: '输入您的邮箱地址，我们将通过邮箱发送重置码',
    'pt': 'Digite seu endereço de e-mail, enviaremos um código de redefinição por e-mail',
  },
  email: {
    en: 'Email Address',
    fr: 'Adresse e-mail',
    zh: '邮箱地址',
    'pt': 'Endereço de E-mail',
  },
  code: {
    en: 'Code',
    fr: 'Code',
    zh: '重置码',
    'pt': 'Código',
  },
  password: {
    en: 'Password',
    fr: 'Mot de passe',
    zh: '密码',
    'pt': 'Senha',
  },
  confirmPassword: {
    en: 'Confirm Password',
    fr: 'Confirmer le mot de passe',
    zh: '确认密码',
    'pt': 'Confirmar Senha',
  },
  send: {
    en: 'Send',
    fr: 'Envoyer',
    zh: '发送',
    'pt': 'Enviar',
  },
  reset: {
    en: 'Reset',
    fr: 'Réinitialiser',
    zh: '重置',
    'pt': 'Redefinir',
  },
  resend: {
    en: 'Resend a new code',
    fr: 'Renvoyer un nouveau code',
    zh: '重新发送验证码',
    'pt': 'Reenviar novo código',
  },
  resent: {
    en: 'New code sent.',
    fr: 'Nouveau code envoyé.',
    zh: '新验证码已发送。',
    'pt': 'Novo código enviado.',
  },
})

export const signIn = Object.freeze({
  title: {
    en: 'Authentication',
    fr: 'Authentification',
    zh: '身份认证',
    'pt': 'Autenticação',
  },
  email: {
    en: 'Email',
    fr: 'Adresse e-mail',
    zh: '邮箱地址',
    'pt': 'E-mail',
  },
  password: {
    en: 'Password',
    fr: 'Mot de passe',
    zh: '密码',
    'pt': 'Senha',
  },
  submit: {
    en: 'Login',
    fr: 'Se connecter',
    zh: '登录',
    'pt': 'Entrar',
  },
  signUp: {
    en: 'Create a new account',
    fr: 'Créer un nouveau compte',
    zh: '创建新账户',
    'pt': 'Criar uma nova conta',
  },
  recoveryCode: {
    en: 'Having trouble logging in?',
    fr: 'Vous avez du mal à vous connecter ?',
    zh: '登录困难？',
    'pt': 'Está com problemas para entrar?',
  },
  passwordReset: {
    en: 'Reset password',
    fr: 'Réinitialiser le mot de passe',
    zh: '重置密码',
    'pt': 'Redefinir senha',
  },
  githubSignIn: {
    en: 'Log in with GitHub',
    fr: 'Se connecter avec GitHub',
    zh: '使用 GitHub 登录',
    'pt': 'Entrar com GitHub',
  },
  discordSignIn: {
    en: 'Log in with Discord',
    fr: 'Se connecter avec Discord',
    zh: '使用 Discord 登录',
    'pt': 'Entrar com Discord',
  },
  oidcSignIn: {
    en: 'Log in with ',
    fr: 'Se connecter avec ',
    zh: '登录',
    'pt': 'Entrar com ',
  },
  continue: {
    en: 'Continue',
    fr: 'Continuer',
    zh: '继续',
    'pt': 'Continuar',
  },
  withPasskey: {
    en: 'Log in with Passkey',
    fr: 'Se connecter avec Passkey',
    zh: '使用 Passkey 登录',
    'pt': 'Entrar com Passkey',
  },
})

export const signUp = Object.freeze({
  title: {
    en: 'Create an account',
    fr: 'Créer un compte',
    zh: '创建账户',
    'pt': 'Criar uma conta',
  },
  email: {
    en: 'Email',
    fr: 'Adresse e-mail',
    zh: '邮箱地址',
    'pt': 'E-mail',
  },
  password: {
    en: 'Password',
    fr: 'Mot de passe',
    zh: '密码',
    'pt': 'Senha',
  },
  confirmPassword: {
    en: 'Confirm Password',
    fr: 'Confirmer le mot de passe',
    zh: '确认密码',
    'pt': 'Confirmar Senha',
  },
  firstName: {
    en: 'First Name',
    fr: 'Prénom',
    zh: '名',
    'pt': 'Nome',
  },
  lastName: {
    en: 'Last Name',
    fr: 'Nom',
    zh: '姓',
    'pt': 'Sobrenome',
  },
  signUp: {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
    'pt': 'Confirmar',
  },
  signIn: {
    en: 'Already have an account? Sign in',
    fr: 'Vous avez déjà un compte ? Connectez-vous.',
    zh: '已有账户？登录',
    'pt': 'Já tem uma conta? Entre',
  },
  bySignUp: {
    en: 'By signing up, you agree to our',
    fr: 'En vous inscrivant, vous acceptez nos',
    zh: '通过注册，您同意我们的',
    'pt': 'Ao se cadastrar, você concorda com nossos',
  },
  linkConnect: {
    en: 'and',
    fr: 'et',
    zh: '和',
    'pt': 'e',
  },
  terms: {
    en: 'Terms of Service',
    fr: 'Conditions d’utilisation',
    zh: '服务条款',
    'pt': 'Termos de Serviço',
  },
  privacyPolicy: {
    en: 'Privacy Policy',
    fr: 'Politique de confidentialité',
    zh: '隐私政策',
    'pt': 'Política de Privacidade',
  },
})

export const recoveryCodeSignIn = Object.freeze({
  title: {
    en: 'Use your recovery code',
    fr: 'Utilisez votre code de récupération',
    zh: '使用恢复码',
    'pt': 'Use seu código de recuperação',
  },
  signIn: {
    en: 'Back to sign in',
    fr: 'Retour à la connexion',
    zh: '返回登录',
    'pt': 'Voltar para login',
  },
  email: {
    en: 'Email',
    fr: 'Adresse e-mail',
    zh: '邮箱地址',
    'pt': 'E-mail',
  },
  recoveryCode: {
    en: 'Recovery Code',
    fr: 'Code de récupération',
    zh: '恢复码',
    'pt': 'Código de Recuperação',
  },
  confirm: {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
    'pt': 'Confirmar',
  },
})

export const smsMfa = Object.freeze({
  title: {
    en: 'SMS Verification',
    fr: 'Vérification par SMS',
    zh: '短信验证',
    'pt': 'Verificação por SMS',
  },
  phoneNumber: {
    en: 'Phone Number',
    fr: 'Numéro de téléphone',
    zh: '手机号',
    'pt': 'Número de Telefone',
  },
  code: {
    en: 'Verification Code',
    fr: 'Code de vérification',
    zh: '验证码',
    'pt': 'Código de Verificação',
  },
  sendCode: {
    en: 'Send code',
    fr: 'Envoyer le code',
    zh: '发送验证码',
    'pt': 'Enviar código',
  },
  verify: {
    en: 'Verify',
    fr: 'Vérifier',
    zh: '验证',
    'pt': 'Verificar',
  },
  resend: {
    en: 'Resend a new code',
    fr: 'Renvoyer un nouveau code',
    zh: '重新发送验证码',
    'pt': 'Reenviar novo código',
  },
  resent: {
    en: 'New code sent.',
    fr: 'Nouveau code envoyé.',
    zh: '新验证码已发送。',
    'pt': 'Novo código enviado.',
  },
  switchToEmail: {
    en: 'Receive MFA Code by Email',
    fr: 'Recevoir le code MFA par e-mail',
    zh: '通过邮箱接收验证码',
    'pt': 'Receber código MFA por e-mail',
  },
  rememberDevice: {
    en: 'Remember this device for 30 days.',
    fr: 'Se souvenir de ce dispositif pour 30 jours.',
    zh: '记住此设备30天。',
    'pt': 'Lembrar este dispositivo por 30 dias.',
  },
})

export const updateInfo = Object.freeze({
  title: {
    en: 'Update your info',
    fr: 'Mettre à jour vos informations',
    zh: '更新您的信息',
    'pt': 'Atualizar suas informações',
  },
  firstName: {
    en: 'First Name',
    fr: 'Prénom',
    zh: '名',
    'pt': 'Nome',
  },
  lastName: {
    en: 'Last Name',
    fr: 'Nom',
    zh: '姓',
    'pt': 'Sobrenome',
  },
  success: {
    en: 'Info updated!',
    fr: 'Informations mises à jour !',
    zh: '信息已更新！',
    'pt': 'Informações atualizadas!',
  },
  confirm: {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
    'pt': 'Confirmar',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Rediriger en arrière',
    zh: '返回',
    'pt': 'Voltar',
  },
})

export const verifyEmail = Object.freeze({
  title: {
    en: 'Verify your email',
    fr: 'Vérifiez votre e-mail',
    zh: '验证您的邮箱',
    'pt': 'Verifique seu e-mail',
  },
  desc: {
    en: 'Enter your verification code received by email',
    fr: 'Entrez le code de vérification reçu par e-mail',
    zh: '输入您通过邮箱收到的验证码',
    'pt': 'Digite o código de verificação recebido por e-mail',
  },
  verify: {
    en: 'Verify',
    fr: 'Vérifier',
    zh: '验证',
    'pt': 'Verificar',
  },
  success: {
    en: 'Verification successful! You can close this page now.',
    fr: 'Vérification réussie ! Vous pouvez fermer cette page maintenant.',
    zh: '验证成功！您可以关闭此页面了。',
    'pt': 'Verificação realizada com sucesso! Você pode fechar esta página agora.',
  },
})

export const switchOrg = Object.freeze({
  title: {
    en: 'Switch Organization',
    fr: 'Changer d\'organisation',
    zh: '切换组织',
    'pt': 'Trocar Organização',
  },
  confirm: {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
    'pt': 'Confirmar',
  },
  success: {
    en: 'Organization changed successfully!',
    fr: 'Organisation changée avec succès !',
    zh: '组织切换成功！',
    'pt': 'Organização alterada com sucesso!',
  },
  redirect: {
    en: 'Redirect back',
    fr: 'Rediriger en arrière',
    zh: '返回',
    'pt': 'Voltar',
  },
})

export const requestError = Object.freeze({
  authFailed: {
    en: 'Authentication Failed.',
    fr: "Échec de l'authentification.",
    zh: '身份认证失败。',
    'pt': 'Falha na autenticação.',
  },
  noUser: {
    en: 'No user found.',
    fr: 'Aucun utilisateur trouvé.',
    zh: '未找到用户。',
    'pt': 'Nenhum usuário encontrado.',
  },
  disabledUser: {
    en: 'This account has been disabled.',
    fr: 'Ce compte a été désactivé.',
    zh: '此账户已被禁用。',
    'pt': 'Esta conta foi desativada.',
  },
  accountLocked: {
    en: 'Account temporarily locked due to excessive login failures.',
    fr: 'Compte temporairement bloqué en raison de trop nombreuses tentatives de connexion échouées.',
    zh: '由于登录失败次数过多，账户暂时被锁定。',
    'pt': 'Conta temporariamente bloqueada devido a muitas tentativas de login falhas.',
  },
  requireNewPassword: {
    en: 'Your new password can not be same as old password.',
    fr: "Votre nouveau mot de passe ne peut pas être identique à l'ancien mot de passe.",
    zh: '您的密码不能与旧密码相同。',
    'pt': 'Sua nova senha não pode ser igual à senha antiga.',
  },
  requireNewEmail: {
    en: 'Your new email can not be same as old email.',
    fr: "Votre nouvelle adresse e-mail ne peut pas être identique à l'ancienne adresse e-mail.",
    zh: '您的邮箱不能与旧邮箱相同。',
    'pt': 'Seu novo e-mail não pode ser igual ao e-mail antigo.',
  },
  emailAlreadyVerified: {
    en: 'The email address is already verified.',
    fr: 'L\'adresse e-mail est déjà vérifiée.',
    zh: '邮箱地址已验证。',
    'pt': 'O endereço de e-mail já foi verificado.',
  },
  optMfaLocked: {
    en: 'Too many failed OTP verification attempts. Please try again after 30 minutes.',
    fr: 'Nombre trop élevé de tentatives échouées de vérification OTP. Veuillez réessayer dans 30 minutes.',
    zh: '验证失败次数过多。请在 30 分钟后重试。',
    'pt': 'Muitas tentativas de verificação OTP falhas. Por favor, tente novamente após 30 minutos.',
  },
  smsMfaLocked: {
    en: 'Too many SMS verification attempts. Please try again after 30 minutes.',
    fr: 'Trop de tentatives de vérification par SMS. Veuillez réessayer dans 30 minutes.',
    zh: '短信验证失败次数过多。请在 30 分钟后重试。',
    'pt': 'Muitas tentativas de verificação por SMS. Por favor, tente novamente após 30 minutos.',
  },
  emailMfaLocked: {
    en: 'Too many email verification attempts. Please try again after 30 minutes.',
    fr: 'Trop de tentatives de vérification par email. Veuillez réessayer dans 30 minutes.',
    zh: '邮箱验证失败次数过多。请在 30 分钟后重试。',
    'pt': 'Muitas tentativas de verificação por e-mail. Por favor, tente novamente após 30 minutos.',
  },
  passwordResetLocked: {
    en: 'Too many password reset requests. Please try again tomorrow.',
    fr: 'Trop de demandes de réinitialisation de mot de passe. Veuillez réessayer demain.',
    zh: '重置密码请求次数过多。请明天再试。',
    'pt': 'Muitas solicitações de redefinição de senha. Por favor, tente novamente amanhã.',
  },
  changeEmailLocked: {
    en: 'Too many send email change code requests. Please try again after 30 minutes.',
    fr: 'Trop de demandes de modification de code de changement d\'adresse e-mail. Veuillez réessayer dans 30 minutes.',
    zh: '发送邮箱验证码请求次数过多。请在 30 分钟后重试。',
    'pt': 'Muitas solicitações de código de alteração de e-mail. Por favor, tente novamente após 30 minutos.',
  },
  emailTaken: {
    en: 'The email address is already in use.',
    fr: 'Cette adresse e-mail est déjà utilisée.',
    zh: '邮箱地址已被使用。',
    'pt': 'O endereço de e-mail já está em uso.',
  },
  wrongCode: {
    en: 'Invalid code.',
    fr: 'Code invalide.',
    zh: '无效的验证码。',
    'pt': 'Código inválido.',
  },
  uniqueAttributeAlreadyExists: {
    en: 'Duplicate value "{{attributeValue}}" for attribute "{{attributeName}}".',
    fr: 'Valeur dupliquée "{{attributeValue}}" pour l\'attribut "{{attributeName}}".',
    zh: '值 "{{attributeValue}}" 已用于属性 "{{attributeName}}"。',
    'pt': 'Valor duplicado "{{attributeValue}}" para o atributo "{{attributeName}}".',
  },
})

export const validateError = Object.freeze({
  passwordIsRequired: {
    en: 'Password is required!',
    fr: 'Le mot de passe est requis !',
    zh: '密码是必填项！',
    'pt': 'Senha é obrigatória!',
  },
  fieldIsRequired: {
    en: 'This field is required!',
    fr: 'Ce champ est requis !',
    zh: '此字段是必填项！',
    'pt': 'Este campo é obrigatório!',
  },
  passwordFormat: {
    en: 'Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    fr: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
    zh: '密码必须至少包含 8 个字符，至少包含一个大写字母、一个小写字母、一个数字和一个特殊字符。',
    'pt': 'A senha deve ter pelo menos 8 caracteres, conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.',
  },
  phoneNumberIsRequired: {
    en: 'Phone number is required!',
    fr: 'Le numéro de téléphone est requis !',
    zh: '手机号是必填项！',
    'pt': 'Número de telefone é obrigatório!',
  },
  wrongPhoneFormat: {
    en: 'the format must be a number up to fifteen digits in length starting with a ‘+’ with country code.',
    fr: 'Le format doit être un numéro de maximum quinze chiffres commençant par un ‘+’ avec l’indicatif du pays.',
    zh: '格式必须为以 ‘+’ 开头，最多十五位的数字，包含国家代码。',
    'pt': 'O formato deve ser um número de até quinze dígitos começando com "+" e o código do país.',
  },
  emailIsRequired: {
    en: 'Email is required!',
    fr: "L'adresse e-mail est requise !",
    zh: '邮箱是必填项！',
    'pt': 'E-mail é obrigatório!',
  },
  wrongEmailFormat: {
    en: 'Wrong email format.',
    fr: "Format d'e-mail incorrect.",
    zh: '邮箱格式错误。',
    'pt': 'Formato de e-mail inválido.',
  },
  isNotEmail: {
    en: 'Wrong email format.',
    fr: "Format d'e-mail incorrect.",
    zh: '邮箱格式错误。',
    'pt': 'Formato de e-mail inválido.',
  },
  isWeakPassword: {
    en: 'Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    fr: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
    zh: '密码必须至少包含 8 个字符，至少包含一个大写字母、一个小写字母、一个数字和一个特殊字符。',
    'pt': 'A senha deve ter pelo menos 8 caracteres, conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.',
  },
  passwordNotMatch: {
    en: 'The password and confirm password do not match.',
    fr: 'Le mot de passe et la confirmation ne correspondent pas.',
    zh: '密码和确认密码不匹配。',
    'pt': 'A senha e a confirmação de senha não coincidem.',
  },
  firstNameIsEmpty: {
    en: 'First name can not be empty.',
    fr: 'Le prénom ne peut pas être vide.',
    zh: '名不能为空。',
    'pt': 'O nome não pode estar vazio.',
  },
  lastNameIsEmpty: {
    en: 'Last name can not be empty.',
    fr: 'Le nom de famille ne peut pas être vide.',
    zh: '姓不能为空。',
    'pt': 'O sobrenome não pode estar vazio.',
  },
  otpCodeLengthIssue: {
    en: 'OTP code can only be 6 digits numbers.',
    fr: 'Le code OTP ne peut être composé que de 6 chiffres.',
    zh: '验证码只能包含 6 位数字。',
    'pt': 'O código OTP deve conter apenas 6 dígitos numéricos.',
  },
  verificationCodeLengthIssue: {
    en: 'Verification code can only be 6 characters.',
    fr: 'Le code de vérification doit contenir 6 caractères.',
    zh: '验证码只能包含 6 个字符。',
    'pt': 'O código de verificação deve conter apenas 6 caracteres.',
  },
})
