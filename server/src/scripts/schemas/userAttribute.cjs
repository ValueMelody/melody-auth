const UserAttribute = {
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
      type: 'string',
      nullable: true,
    },
  },
  required: [
    'id', 'name', 'includeInSignUpForm', 'requiredInSignUpForm',
    'includeInIdTokenBody', 'includeInUserInfo', 'createdAt', 'updatedAt', 'deletedAt',
  ],
}

const PostUserAttributeReq = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    includeInSignUpForm: { type: 'boolean' },
    requiredInSignUpForm: { type: 'boolean' },
    includeInIdTokenBody: { type: 'boolean' },
    includeInUserInfo: { type: 'boolean' },
  },
  required: [
    'name', 'includeInSignUpForm', 'requiredInSignUpForm',
    'includeInIdTokenBody', 'includeInUserInfo',
  ],
}

const PutUserAttributeReq = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    includeInSignUpForm: { type: 'boolean' },
    requiredInSignUpForm: { type: 'boolean' },
    includeInIdTokenBody: { type: 'boolean' },
    includeInUserInfo: { type: 'boolean' },
  },
}

module.exports = {
  UserAttribute, PostUserAttributeReq, PutUserAttributeReq,
}
