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
  required: ['id', 'name', 'note', 'type', 'createdAt', 'updatedAt', 'deletedAt'],
}

const ScopeDetail = {
  allOf: [
    { $ref: '#/components/schemas/Scope' },
    {
      type: 'object',
      properties: {
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
                type: 'string',
                nullable: true,
              },
            },
            required: ['id', 'scopeId', 'locale', 'value', 'createdAt', 'updatedAt', 'deletedAt'],
          },
        },
      },
      required: ['locales'],
    },
  ],
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
    locales: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          locale: { type: 'string' },
          value: { type: 'string' },
        },
        required: ['locale', 'value'],
      },
    },
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
    locales: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          locale: { type: 'string' },
          value: { type: 'string' },
        },
        required: ['locale', 'value'],
      },
    },
  },
  required: ['name', 'type'],
}

module.exports = {
  Scope, ScopeDetail, PutScopeReq, PostScopeReq,
}
