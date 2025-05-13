const PostInitiateReq = {
  type: 'object',
  properties: {
    redirectUri: { type: 'string' },
    clientId: { type: 'string' },
    codeChallenge: { type: 'string' },
    codeChallengeMethod: {
      type: 'string',
      enum: ['S256', 'plain'],
    },
    scopes: {
      type: 'array',
      items: { type: 'string' },
    },
    locale: { type: 'string' },
    org: { type: 'string' },
  },
  required: [
    'redirectUri', 'clientId', 'codeChallenge',
    'codeChallengeMethod', 'scopes', 'locale',
  ],
}

const PostSignInReq = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    password: { type: 'string' },
    sessionId: { type: 'string' },
  },
  required: [
    'email', 'password', 'sessionId',
  ],
}

const TokenExchangeReq = {
  type: 'object',
  properties: {
    codeVerifier: { type: 'string' },
    sessionId: { type: 'string' },
  },
  required: ['codeVerifier', 'sessionId'],
}

const TokenRefreshReq = {
  type: 'object',
  properties: { refreshToken: { type: 'string' } },
  required: ['refreshToken'],
}

const AuthRes = {
  type: 'object',
  properties: {
    sessionId: { type: 'string' },
    nextStep: {
      type: 'string',
      enum: ['consent', 'mfa_enroll', 'email_mfa', 'sms_mfa', 'otp_setup', 'opt_mfa', 'passkey_enroll'],
    },
    success: { type: 'boolean' },
  },
  required: ['sessionId', 'success'],
}

const TokenExchangeRes = {
  type: 'object',
  properties: {
    access_token: { type: 'string' },
    expires_in: { type: 'number' },
    expires_on: { type: 'number' },
    not_before: { type: 'number' },
    token_type: {
      type: 'string', enum: ['Bearer'],
    },
    scope: { type: 'string' },
    refresh_token: { type: 'string' },
    refresh_token_expires_in: { type: 'number' },
    refresh_token_expires_on: { type: 'number' },
    id_token: { type: 'string' },
  },
  required: ['access_token', 'expires_in', 'expires_on', 'not_before', 'token_type', 'scope'],
}

const TokenRefreshRes = {
  type: 'object',
  properties: {
    access_token: { type: 'string' },
    expires_in: { type: 'number' },
    expires_on: { type: 'number' },
    token_type: {
      type: 'string', enum: ['Bearer'],
    },
  },
  required: ['access_token', 'expires_in', 'expires_on', 'token_type'],
}

module.exports = {
  PostInitiateReq,
  PostSignInReq,
  TokenExchangeReq,
  TokenRefreshReq,
  AuthRes,
  TokenExchangeRes,
  TokenRefreshRes,
}
