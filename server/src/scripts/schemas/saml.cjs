const SamlIdp = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    userIdAttribute: { type: 'string' },
    emailAttribute: {
      type: 'string', nullable: true,
    },
    firstNameAttribute: {
      type: 'string', nullable: true,
    },
    lastNameAttribute: {
      type: 'string', nullable: true,
    },
    metadata: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    deletedAt: {
      type: 'string',
      nullable: true,
    },
  },
  required: ['id', 'name', 'userIdAttribute', 'emailAttribute', 'firstNameAttribute', 'lastNameAttribute', 'metadata', 'createdAt', 'updatedAt', 'deletedAt'],
}

const PostSamlIdpReq = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    userIdAttribute: { type: 'string' },
    emailAttribute: {
      type: 'string', nullable: true,
    },
    firstNameAttribute: {
      type: 'string', nullable: true,
    },
    lastNameAttribute: {
      type: 'string', nullable: true,
    },
    metadata: { type: 'string' },
  },
  required: ['name', 'userIdAttribute', 'emailAttribute', 'firstNameAttribute', 'lastNameAttribute', 'metadata'],
}

const PutSamlIdpReq = {
  type: 'object',
  properties: {
    userIdAttribute: { type: 'string' },
    emailAttribute: { type: 'string' },
    firstNameAttribute: { type: 'string' },
    lastNameAttribute: { type: 'string' },
    metadata: { type: 'string' },
  },
}

module.exports = {
  SamlIdp, PutSamlIdpReq, PostSamlIdpReq,
}
