const fs = require('fs')
const swaggerJsdoc = require('swagger-jsdoc')
const {
  PostInitiateReq,
  PostSignInReq,
  PostSignInWithRecoveryCodeReq,
  GetSignUpInfoRes,
  PostSignUpReq,
  TokenExchangeReq,
  MfaEnrollmentInfoRes,
  PostMfaEnrollmentReq,
  MfaCodeReq,
  OtpMfaSetupRes,
  OtpMfaConfigRes,
  SmsMfaSetupReq,
  SmsMfaConfigRes,
  RecoveryCodeEnrollRes,
  AuthRes,
  TokenExchangeRes,
  TokenRefreshReq,
  TokenRefreshRes,
  SignOutReq,
  GetAppConsentRes,
  ResetPasswordReq,
} = require('./schemas/embedded.cjs')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Melody Auth Embedded Auth API',
      version: '0.0.1',
    },
    components: {
      schemas: {
        PostInitiateReq,
        PostSignInReq,
        PostSignInWithRecoveryCodeReq,
        GetSignUpInfoRes,
        PostSignUpReq,
        TokenExchangeReq,
        MfaEnrollmentInfoRes,
        PostMfaEnrollmentReq,
        MfaCodeReq,
        OtpMfaSetupRes,
        OtpMfaConfigRes,
        SmsMfaSetupReq,
        SmsMfaConfigRes,
        RecoveryCodeEnrollRes,
        AuthRes,
        TokenExchangeRes,
        TokenRefreshReq,
        TokenRefreshRes,
        SignOutReq,
        GetAppConsentRes,
        ResetPasswordReq,
      },
    },
  },
  apis: [
    './src/routes/embedded.tsx',
  ],
}

const swaggerSpec = swaggerJsdoc(options)

fs.writeFileSync(
  './src/scripts/embedded-swagger.json',
  JSON.stringify(
    swaggerSpec,
    null,
    2,
  ),
  'utf-8',
)
