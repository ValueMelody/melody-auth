export enum Error {
  NoApp = 'No app found',
  WrongClientType = 'Wrong client type',
  WrongClientSecret = 'Wrong client secret',
  WrongOrigin = 'Request from unexpected origin',
  AppDisabled = 'This app has been disabled',
  EmailTaken = 'The email address is already in use.',
  WrongRedirectUri = 'Invalid redirect_uri',
  NoUser = 'No user found',
  AccountLocked = 'Account temporarily locked due to excessive login failures',
  OtpMfaLocked = 'Too many failed OTP verification attempts. Please try again after 30 minutes.',
  UserDisabled = 'This account has been disabled',
  EmailAlreadyVerified = 'Email already verified',
  OtpAlreadySet = 'OTP authentication already set',
  MfaEnrolled = 'User already enrolled with MFA',
  NoConsent = 'User consent required',
  WrongCode = 'Invalid code',
  WrongMfaCode = 'Invalid MFA code',
  RequireDifferentPassword = 'New password same as old password',
  MfaNotVerified = 'MFA code not verified',
  WrongCodeVerifier = 'Invalid code_verifier',
  WrongGrantType = 'Invalid grant_type',
  WrongRefreshToken = 'Invalid refresh_token',
  UniqueKey = 'Unique key constraint failed',
  NoEmailSender = 'No email sender',
}
export const common = Object.freeze({
  documentTitle: {
    en: 'Melody Auth',
    fr: 'Melody Auth',
  },
  poweredBy: {
    en: 'Powered by',
    fr: 'Propulsé par',
  },
  poweredByAuth: {
    en: 'Powered by Melody Auth',
    fr: 'Propulsé par Melody Auth',
  },
  selectLocale: {
    en: 'Select Locale',
    fr: 'Sélectionner la langue'
  }
})

export const validateError = Object.freeze({
  passwordIsRequired: {
    en: 'Password is required!',
    fr: 'Le mot de passe est requis !',
  },
  emailIsRequired: {
    en: 'Email is required!',
    fr: "L'adresse e-mail est requise !",
  },
  isNotEmail: {
    en: 'Wrong email format.',
    fr: "Format d'e-mail incorrect.",
  },
  isWeakPassword: {
    en: 'Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    fr: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
  },
  passwordNotMatch: {
    en: 'The password and confirm password do not match.',
    fr: 'Le mot de passe et la confirmation ne correspondent pas.',
  },
  firstNameIsEmpty: {
    en: 'First name can not be empty.',
    fr: 'Le prénom ne peut pas être vide.',
  },
  lastNameIsEmpty: {
    en: 'Last name can not be empty.',
    fr: 'Le nom de famille ne peut pas être vide.',
  },
  otpCodeLengthIssue: {
    en: 'OTP code can only be 6 digits numbers.',
    fr: 'Le code OTP ne peut être composé que de 6 chiffres.',
  },
  verificationCodeLengthIssue: {
    en: 'Verification code can only be 8 characters.',
    fr: 'Le code de vérification doit contenir 8 caractères.',
  },
})

export const requestError = Object.freeze({
  authFailed: {
    en: 'Authentication Failed.',
    fr: "Échec de l'authentification.",
  },
  noUser: {
    en: 'No user found.',
    fr: 'Aucun utilisateur trouvé.',
  },
  disabledUser: {
    en: 'This account has been disabled.',
    fr: 'Ce compte a été désactivé.',
  },
  accountLocked: {
    en: 'Account temporarily locked due to excessive login failures.',
    fr: 'Compte temporairement bloqué en raison de trop nombreuses tentatives de connexion échouées.',
  },
  requireNewPassword: {
    en: 'Your new password can not be same as old password.',
    fr: "Votre nouveau mot de passe ne peut pas être identique à l'ancien mot de passe.",
  },
  optMfaLocked: {
    en: 'Too many failed OTP verification attempts. Please try again after 30 minutes.',
    fr: 'Nombre trop élevé de tentatives échouées de vérification OTP. Veuillez réessayer dans 30 minutes.',
  },
  emailTaken: {
    en: 'The email address is already in use.',
    fr: 'Cette adresse e-mail est déjà utilisée.',
  },
  wrongCode: {
    en: 'Invalid code.',
    fr: 'Code invalide.',
  },
})

export const authorizePassword = Object.freeze({
  title: {
    en: 'Authentication',
    fr: 'Authentification',
  },
  email: {
    en: 'Email',
    fr: 'Adresse e-mail',
  },
  password: {
    en: 'Password',
    fr: 'Mot de passe',
  },
  submit: {
    en: 'Login',
    fr: 'Se connecter',
  },
  signUp: {
    en: 'Create a new account',
    fr: 'Créer un nouveau compte',
  },
  passwordReset: {
    en: 'Reset password',
    fr: 'Réinitialiser le mot de passe',
  },
})

export const authorizeAccount = Object.freeze({
  title: {
    en: 'Create an account',
    fr: 'Créer un compte',
  },
  email: {
    en: 'Email',
    fr: 'Adresse e-mail',
  },
  password: {
    en: 'Password',
    fr: 'Mot de passe',
  },
  confirmPassword: {
    en: 'Confirm Password',
    fr: 'Confirmer le mot de passe',
  },
  firstName: {
    en: 'First Name',
    fr: 'Prénom',
  },
  lastName: {
    en: 'Last Name',
    fr: 'Nom',
  },
  signUp: {
    en: 'Confirm',
    fr: 'Confirmer',
  },
  signIn: {
    en: 'Already have an account? Sign in',
    fr: 'Vous avez déjà un compte ? Connectez-vous.',
  },
})

export const authorizeOtpMfa = Object.freeze({
  setup: {
    en: 'Use your Google Authenticator to scan the image below:',
    fr: "Utilisez votre Google Authenticator pour scanner l'image ci-dessous :",
  },
  code: {
    en: 'Enter the code generated by your Google Authenticator',
    fr: 'Entrez le code généré par votre Google Authenticator',
  },
  verify: {
    en: 'Verify',
    fr: 'Vérifier',
  },
  switchToEmail: {
    en: 'Receive MFA Code by Email',
    fr: 'Recevoir le code MFA par e-mail',
  },
})

export const authorizeConsent = Object.freeze({
  title: {
    en: 'Authorize App',
    fr: "Autoriser l'application",
  },
  requestAccess: {
    en: 'is requesting access to your account.',
    fr: "demande l'accès à votre compte.",
  },
  accept: {
    en: 'Accept',
    fr: 'Accepter',
  },
  decline: {
    en: 'Decline',
    fr: 'Refuser',
  },
})

export const authorizeMfaEnroll = Object.freeze({
  title: {
    en: 'Select one of the MFA type',
    fr: 'Sélectionnez un type de MFA',
  },
  email: {
    en: 'Email',
    fr: 'E-mail',
  },
  otp: {
    en: 'Authenticator',
    fr: 'Authentificateur',
  },
})

export const authorizeEmailMfa = Object.freeze({
  title: {
    en: 'A verification code has been sent to your email.',
    fr: 'Un code de vérification a été envoyé à votre adresse e-mail.',
  },
  verify: {
    en: 'Verify',
    fr: 'Vérifier',
  },
  resend: {
    en: 'Resend a new code',
    fr: 'Renvoyer un nouveau code',
  },
  resent: {
    en: 'New code sent.',
    fr: 'Nouveau code envoyé.',
  },
})

export const authorizeReset = Object.freeze({
  title: {
    en: 'Reset your password',
    fr: 'Réinitialiser votre mot de passe',
  },
  success: {
    en: 'Password reset successful!',
    fr: 'Réinitialisation du mot de passe réussie !',
  },
  signIn: {
    en: 'Sign in',
    fr: 'Se connecter',
  },
  backSignIn: {
    en: 'Back to sign in',
    fr: 'Retour à la connexion',
  },
  desc: {
    en: 'Enter your email address, we will send you a reset code by email',
    fr: 'Entrez votre adresse e-mail, nous vous enverrons un code de réinitialisation par e-mail.',
  },
  email: {
    en: 'Email',
    fr: 'Adresse e-mail',
  },
  code: {
    en: 'Code',
    fr: 'Code',
  },
  password: {
    en: 'Password',
    fr: 'Mot de passe',
  },
  confirmPassword: {
    en: 'Confirm Password',
    fr: 'Confirmer le mot de passe',
  },
  send: {
    en: 'Send',
    fr: 'Envoyer',
  },
  reset: {
    en: 'Reset',
    fr: 'Réinitialiser',
  },
  resend: {
    en: 'Resend a new code',
    fr: 'Renvoyer un nouveau code',
  },
  resent: {
    en: 'New code sent.',
    fr: 'Nouveau code envoyé.',
  },
})

export const verifyEmail = Object.freeze({
  title: {
    en: 'Verify your email',
    fr: 'Vérifiez votre e-mail',
  },
  desc: {
    en: 'Enter your verification code received by email',
    fr: 'Entrez le code de vérification reçu par e-mail',
  },
  verify: {
    en: 'Verify',
    fr: 'Vérifier',
  },
  success: {
    en: 'Verification successful! You can close this page now.',
    fr: 'Vérification réussie ! Vous pouvez fermer cette page maintenant.',
  },
})

export const emailVerificationEmail = Object.freeze({
  subject: {
    en: 'Welcome to Melody Auth! Please verify your email address',
    fr: 'Bienvenue sur Melody Auth ! Veuillez vérifier votre adresse e-mail',
  },
  title: {
    en: 'Welcome to Melody Auth',
    fr: 'Bienvenue sur Melody Auth',
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
