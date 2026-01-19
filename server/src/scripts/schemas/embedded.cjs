const { Banner } = require('./app.cjs')

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
  },
  required: [
    'email', 'password',
  ],
}

const PostSignInWithRecoveryCodeReq = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    recoveryCode: { type: 'string' },
  },
  required: ['recoveryCode'],
}

const GetSignUpInfoRes = {
  type: 'object',
  properties: {
    userAttributes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          includeInSignUpForm: { type: 'boolean' },
          requiredInSignUpForm: { type: 'boolean' },
          includeInIdTokenBody: { type: 'boolean' },
          includeInUserInfo: { type: 'boolean' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' },
          deletedAt: {
            type: 'string', nullable: true, example: null,
          },
        },
      },
    },
  },
  required: ['userAttributes'],
}

const PostSignUpReq = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    password: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    attributes: {
      type: 'object',
      additionalProperties: { type: 'string' },
      example: {
        1: 'value for attributeId 1',
        2: 'value for attributeId 2',
      },
    },
  },
  required: [
    'email', 'password',
  ],
}

const MfaEnrollmentInfoRes = {
  type: 'object',
  properties: {
    mfaTypes: {
      type: 'array',
      items: {
        type: 'string', enum: ['otp', 'email', 'sms'],
      },
    },
  },
  required: ['mfaTypes'],
}

const PostMfaEnrollmentReq = {
  type: 'object',
  properties: {
    type: {
      type: 'string', enum: ['otp', 'email', 'sms'],
    },
  },
  required: ['type'],
}

const MfaCodeReq = {
  type: 'object',
  properties: {
    mfaCode: { type: 'string' },
    rememberDevice: { type: 'boolean' },
  },
  required: ['mfaCode'],
}

const OtpMfaSetupRes = {
  type: 'object',
  properties: {
    otpUri: { type: 'string' },
    otpSecret: { type: 'string' },
  },
  required: ['otpUri', 'otpSecret'],
}

const OtpMfaConfigRes = {
  type: 'object',
  properties: { couldFallbackToEmailMfa: { type: 'boolean' } },
  required: ['couldFallbackToEmailMfa'],
}

const SmsMfaSetupReq = {
  type: 'object',
  properties: { phoneNumber: { type: 'string' } },
  required: ['phoneNumber'],
}

const SmsMfaConfigRes = {
  type: 'object',
  properties: {
    allowFallbackToEmailMfa: { type: 'boolean' },
    countryCode: { type: 'string' },
    phoneNumber: { type: 'string' },
  },
  required: ['allowFallbackToEmailMfa', 'countryCode', 'phoneNumber'],
}

const PasskeyEnrollInfoRes = {
  type: 'object',
  properties: {
    enrollOptions: {
      type: 'object',
      description: 'PublicKeyCredentialCreationOptions suitable for JSON transmission to navigator.credentials.create()',
      required: ['rp', 'user', 'challenge', 'pubKeyCredParams'],
      properties: {
        rp: {
          type: 'object',
          description: 'Relying Party entity',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            id: { type: 'string' },
          },
        },
        user: {
          type: 'object',
          description: 'User entity JSON',
          required: ['id', 'name', 'displayName'],
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            displayName: { type: 'string' },
          },
        },
        challenge: {
          type: 'string',
          format: 'base64url',
          description: 'Base64URL-encoded challenge',
        },
        pubKeyCredParams: {
          type: 'array',
          description: 'Public key credential parameters',
          items: {
            type: 'object',
            required: ['type', 'alg'],
            properties: {
              type: {
                type: 'string',
                enum: ['public-key'],
              },
              alg: {
                type: 'integer',
                description: 'COSE algorithm identifier',
              },
            },
          },
        },
        timeout: {
          type: 'integer',
          format: 'int64',
          description: 'Milliseconds to wait for completion',
        },
        excludeCredentials: {
          type: 'array',
          description: 'Credentials to exclude',
          items: {
            type: 'object',
            required: ['id', 'type'],
            properties: {
              id: {
                type: 'string', format: 'base64url',
              },
              type: {
                type: 'string', enum: ['public-key'],
              },
              transports: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb'],
                },
              },
            },
          },
        },
        authenticatorSelection: {
          type: 'object',
          description: 'Authenticator selection criteria',
          properties: {
            authenticatorAttachment: {
              type: 'string',
              enum: ['platform', 'cross-platform'],
            },
            requireResidentKey: { type: 'boolean' },
            residentKey: {
              type: 'string',
              enum: ['discouraged', 'preferred', 'required'],
            },
            userVerification: {
              type: 'string',
              enum: ['discouraged', 'preferred', 'required'],
            },
          },
        },
        hints: {
          type: 'array',
          description: 'Credential UX hints',
          items: {
            type: 'string',
            enum: ['hybrid', 'security-key', 'client-device'],
          },
        },
        attestation: {
          type: 'string',
          enum: ['direct', 'enterprise', 'indirect', 'none'],
          description: 'Attestation conveyance preference',
        },
        attestationFormats: {
          type: 'array',
          description: 'Supported attestation formats',
          items: {
            type: 'string',
            enum: ['fido-u2f', 'packed', 'android-safetynet', 'android-key', 'tpm', 'apple', 'none'],
          },
        },
        extensions: {
          type: 'object',
          description: 'Authentication extensions inputs',
          properties: {
            appid: { type: 'string' },
            credProps: { type: 'boolean' },
            hmacCreateSecret: { type: 'boolean' },
            minPinLength: { type: 'boolean' },
          },
        },
      },
    },
  },
  required: ['enrollOptions'],
}

const PostPasskeyEnrollReq = {
  type: 'object',
  properties: {
    enrollInfo: {
      type: 'object',
      description: 'Registration response JSON from navigator.credentials.create(), with all ArrayBuffers Base64URL-encoded',
      required: ['id', 'rawId', 'response', 'clientExtensionResults', 'type'],
      properties: {
        id: {
          type: 'string',
          format: 'base64url',
          description: 'Base64URL-encoded credential ID',
        },
        rawId: {
          type: 'string',
          format: 'base64url',
          description: 'Base64URL-encoded raw credential ID',
        },
        response: {
          type: 'object',
          description: 'Authenticator attestation response, with all binary fields Base64URL-encoded',
          required: ['clientDataJSON', 'attestationObject'],
          properties: {
            clientDataJSON: {
              type: 'string',
              format: 'base64url',
              description: 'Base64URL-encoded JSON of the clientData',
            },
            attestationObject: {
              type: 'string',
              format: 'base64url',
              description: 'Base64URL-encoded CBOR attestation object',
            },
            authenticatorData: {
              type: 'string',
              format: 'base64url',
              description: 'Base64URL-encoded authenticatorData (optional)',
            },
            transports: {
              type: 'array',
              description: 'Supported authenticator transports (optional)',
              items: {
                type: 'string',
                enum: ['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb'],
              },
            },
            publicKeyAlgorithm: {
              type: 'integer',
              description: 'COSE algorithm identifier (optional)',
            },
            publicKey: {
              type: 'string',
              format: 'base64url',
              description: 'Base64URL-encoded raw public key (optional)',
            },
          },
        },
        authenticatorAttachment: {
          type: 'string',
          description: 'Where the credential is stored (optional)',
          enum: ['platform', 'cross-platform'],
        },
        clientExtensionResults: {
          type: 'object',
          description: 'Results of any client-side extensions',
          properties: {
            appid: {
              type: 'boolean',
              description: 'appid extension result (optional)',
            },
            credProps: {
              type: 'object',
              description: 'credProps extension result (optional)',
              properties: {
                rk: {
                  type: 'boolean',
                  description: 'Whether the credential is resident-key capable',
                },
              },
            },
            hmacCreateSecret: {
              type: 'boolean',
              description: 'hmacCreateSecret extension result (optional)',
            },
          },
        },
        type: {
          type: 'string',
          description: 'Credential type',
          enum: ['public-key'],
        },
      },
    },
  },
  required: ['enrollInfo'],
}

const PostPasskeyEnrollDeclineReq = {
  type: 'object',
  properties: { remember: { type: 'boolean' } },
  required: ['remember'],
}

const PasskeyVerifyInfoRes = {
  type: 'object',
  properties: {
    passkeyOption: {
      type: 'object',
      nullable: true,
      description: 'A variant of PublicKeyCredentialRequestOptions suitable for JSON transmission to the browser to be passed into navigator.credentials.get().',
      required: ['challenge'],
      properties: {
        challenge: {
          type: 'string',
          format: 'base64url',
          description: 'Base64URL-encoded challenge',
        },
        timeout: {
          type: 'integer',
          format: 'int64',
          description: 'Milliseconds the caller is willing to wait for the call to complete',
        },
        rpId: {
          type: 'string',
          description: 'Relying Party identifier',
        },
        allowCredentials: {
          type: 'array',
          description: 'List of credential descriptors that are allowed for assertion',
          items: {
            type: 'object',
            required: ['id', 'type'],
            properties: {
              id: {
                type: 'string',
                format: 'base64url',
                description: 'Base64URL-encoded credential ID',
              },
              type: {
                type: 'string',
                enum: ['public-key'],
                description: 'Credential type',
              },
              transports: {
                type: 'array',
                description: 'Allowed authenticator transports',
                items: {
                  type: 'string',
                  enum: ['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb'],
                },
              },
            },
          },
        },
        userVerification: {
          type: 'string',
          enum: ['discouraged', 'preferred', 'required'],
          description: 'User verification requirement',
        },
        hints: {
          type: 'array',
          description: 'Hints to guide the browser’s authenticator UX',
          items: {
            type: 'string',
            enum: ['hybrid', 'security-key', 'client-device'],
          },
        },
        extensions: {
          type: 'object',
          description: 'Authentication extension inputs',
          properties: {
            appid: { type: 'string' },
            credProps: { type: 'boolean' },
            hmacCreateSecret: { type: 'boolean' },
            minPinLength: { type: 'boolean' },
          },
        },
      },
    },
  },
  required: ['passkeyOption'],
}

const PostPasskeyVerifyReq = {
  type: 'object',
  properties: {
    passkeyInfo: {
      type: 'object',
      description: 'Authentication response JSON from navigator.credentials.get(), with all ArrayBuffers Base64URL-encoded',
      required: ['id', 'rawId', 'response', 'clientExtensionResults', 'type'],
      properties: {
        id: {
          type: 'string',
          format: 'base64url',
          description: 'Base64URL-encoded credential ID',
        },
        rawId: {
          type: 'string',
          format: 'base64url',
          description: 'Base64URL-encoded raw credential ID',
        },
        response: {
          type: 'object',
          description: 'Authenticator assertion response, with all binary fields Base64URL-encoded',
          required: ['clientDataJSON', 'authenticatorData', 'signature'],
          properties: {
            clientDataJSON: {
              type: 'string',
              format: 'base64url',
              description: 'Base64URL-encoded JSON of the clientData',
            },
            authenticatorData: {
              type: 'string',
              format: 'base64url',
              description: 'Base64URL-encoded authenticatorData',
            },
            signature: {
              type: 'string',
              format: 'base64url',
              description: 'Base64URL-encoded assertion signature',
            },
            userHandle: {
              type: 'string',
              format: 'base64url',
              description: 'Base64URL-encoded user handle (optional)',
            },
          },
        },
        authenticatorAttachment: {
          type: 'string',
          description: 'Where the credential is stored (optional)',
          enum: ['platform', 'cross-platform'],
        },
        clientExtensionResults: {
          type: 'object',
          description: 'Results of any client-side extensions',
          properties: {
            appid: {
              type: 'boolean',
              description: 'appid extension result (optional)',
            },
            credProps: {
              type: 'object',
              description: 'credProps extension result (optional)',
              properties: {
                rk: {
                  type: 'boolean',
                  description: 'Whether the credential is resident-key capable',
                },
              },
            },
            hmacCreateSecret: {
              type: 'boolean',
              description: 'hmacCreateSecret extension result (optional)',
            },
          },
        },
        type: {
          type: 'string',
          description: 'Credential type',
          enum: ['public-key'],
        },
      },
    },
    challenge: {
      type: 'string', description: 'The challenge value read from the response of Get passkey verify options',
    },
  },
  required: ['passkeyInfo', 'challenge'],
}

const UserOrgsRes = {
  type: 'object',
  properties: {
    orgs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          slug: { type: 'string' },
          companyLogoUrl: { type: 'string' },
        },
      },
    },
    activeOrgSlug: { type: 'string' },
  },
  required: ['orgs', 'activeOrgSlug'],
}

const PostProcessSwitchOrgReq = {
  type: 'object',
  properties: { org: { type: 'string' } },
  required: ['org'],
}

const RecoveryCodeEnrollRes = {
  type: 'object',
  properties: { recoveryCode: { type: 'string' } },
  required: ['recoveryCode'],
}

const AuthRes = {
  type: 'object',
  properties: {
    sessionId: { type: 'string' },
    nextStep: {
      type: 'string',
      enum: ['consent', 'mfa_enroll', 'email_mfa', 'sms_mfa', 'otp_setup', 'otp_mfa', 'passkey_enroll'],
    },
    success: { type: 'boolean' },
  },
  required: ['sessionId', 'success'],
}

const TokenExchangeReq = {
  type: 'object',
  properties: {
    codeVerifier: { type: 'string' },
    sessionId: { type: 'string' },
  },
  required: ['codeVerifier', 'sessionId'],
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

const TokenRefreshReq = {
  type: 'object',
  properties: { refreshToken: { type: 'string' } },
  required: ['refreshToken'],
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

const SignOutReq = {
  type: 'object',
  properties: {
    refreshToken: { type: 'string' }, clientId: { type: 'string' },
  },
  required: ['refreshToken', 'clientId'],
}

const GetAppConsentRes = {
  type: 'object',
  properties: {
    scopes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          note: { type: 'string' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' },
          deletedAt: {
            type: 'string', nullable: true, example: null,
          },
          locales: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                scopeId: { type: 'number' },
                locale: { type: 'string' },
                value: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                deletedAt: {
                  type: 'string', nullable: true, example: null,
                },
              },
            },
          },
        },
      },
    },
    appName: { type: 'string' },
  },
  required: ['scopes', 'appName'],
}

const AppBannersRes = {
  type: 'object',
  properties: {
    banners: {
      type: 'array', items: { $ref: '#/components/schemas/Banner' },
    },
  },
  required: ['banners'],
}

const ResetPasswordReq = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    locale: { type: 'string' },
  },
  required: ['email'],
}

module.exports = {
  AppBannersRes,
  Banner,
  PostInitiateReq,
  PostSignInReq,
  PostSignInWithRecoveryCodeReq,
  GetSignUpInfoRes,
  PostSignUpReq,
  TokenExchangeReq,
  TokenRefreshReq,
  MfaEnrollmentInfoRes,
  PostMfaEnrollmentReq,
  MfaCodeReq,
  OtpMfaSetupRes,
  OtpMfaConfigRes,
  SmsMfaSetupReq,
  SmsMfaConfigRes,
  PasskeyEnrollInfoRes,
  PostPasskeyEnrollReq,
  PostPasskeyEnrollDeclineReq,
  PasskeyVerifyInfoRes,
  PostPasskeyVerifyReq,
  RecoveryCodeEnrollRes,
  AuthRes,
  TokenExchangeRes,
  TokenRefreshRes,
  SignOutReq,
  GetAppConsentRes,
  ResetPasswordReq,
  UserOrgsRes,
  PostProcessSwitchOrgReq,
}
