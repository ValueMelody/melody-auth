const Scope = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    note: { type: 'string' },
    type: {
      type: 'string',
      enum: ['spa', 's2s'],
    },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    deletedAt: {
      type: 'string',
      nullable: true,
    },
  },
}

const PutScopeReq = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    note: { type: 'string' },
  },
}

const PostScopeReq = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    type: {
      type: 'string',
      enum: ['spa', 's2s'],
    },
    note: { type: 'string' },
  },
  required: ['name', 'type'],
}

module.exports = {
  Scope, PutScopeReq, PostScopeReq,
}
