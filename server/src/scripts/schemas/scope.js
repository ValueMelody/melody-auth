const Scope = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    type: {
      type: 'string',
      enum: ['spa', 's2s'],
    },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    "deletedAt": {
      "type": "string",
      "nullable": true
    }
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
  },
  required: ['name'],
}

const PostScopeReq = {
  allOf: [
    { $ref: '#/components/schemas/PutScopeReq' },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['spa', 's2s'],
        },
      },
      required: ['type'],
    },
  ],
}

module.exports = {
  Scope, PutScopeReq, PostScopeReq
}