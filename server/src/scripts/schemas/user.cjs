const User = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    authId: { type: 'string' },
    email: {
      type: 'string',
      nullable: true,
    },
    linkedAuthId: {
      type: 'string',
      nullable: true,
    },
    socialAccountId: {
      type: 'string',
      nullable: true,
    },
    socialAccountType: {
      type: 'string',
      nullable: true,
    },
    firstName: {
      type: 'string',
      nullable: true,
    },
    lastName: {
      type: 'string',
      nullable: true,
    },
    locale: { type: 'string' },
    loginCount: { type: 'number' },
    mfaTypes: {
      type: 'array',
      items: { type: 'string' },
    },
    emailVerified: { type: 'boolean' },
    otpVerified: { type: 'boolean' },
    smsPhoneNumberVerified: { type: 'boolean' },
    isActive: { type: 'boolean' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    deletedAt: {
      type: 'string',
      nullable: true,
    },
  },
  required: ['id', 'authId', 'email', 'socialAccountId', 'socialAccountType', 'firstName', 'lastName', 'locale',
    'emailVerified', 'otpVerified', 'loginCount', 'mfaTypes', 'smsPhoneNumberVerified', 'isActive', 'createdAt', 'updatedAt', 'deletedAt',
  ],
}

const UserDetail = {
  allOf: [
    { $ref: '#/components/schemas/User' },
    {
      type: 'object',
      properties: {
        roles: {
          type: 'array',
          items: { type: 'string' },
          nullable: true,
        },
        org: {
          type: 'object',
          properties: {
            id: { type: 'number' }, name: { type: 'string' }, slug: { type: 'string' },
          },
          nullable: true,
        },
        orgGroups: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
            },
          },
          nullable: true,
        },
        attributes: {
          type: 'object',
          additionalProperties: { type: 'string' },
          example: {
            'attribute name 1': 'value for attribute name 1',
            'attribute name 2': 'value for attribute name 2',
          },
          nullable: true,
        },
      },
      required: ['roles'],
    },
  ],
}

const UserConsentedApp = {
  type: 'object',
  properties: {
    appId: { type: 'number' },
    appName: { type: 'string' },
  },
  required: ['appId', 'appName'],
}

const UserPasskey = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    credentialId: { type: 'string' },
    counter: { type: 'number' },
  },
  required: ['id', 'credentialId', 'counter'],
}

const PutUserReq = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    isActive: { type: 'boolean' },
    locale: { type: 'string' },
    orgSlug: { type: 'string' },
    roles: {
      type: 'array',
      items: { type: 'string' },
    },
    attributes: {
      type: 'object',
      additionalProperties: {
        type: 'string', nullable: true,
      },
      example: {
        1: 'value for attributeId 1',
        2: 'value for attributeId 2',
      },
    },
  },
}

module.exports = {
  User, UserDetail, UserPasskey, PutUserReq, UserConsentedApp,
}
