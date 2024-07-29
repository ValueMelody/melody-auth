const App = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    clientId: { type: 'string' },
    name: { type: 'string' },
    isActive: { type: 'boolean' },
    type: {
      type: 'string',
      enum: ['spa', 's2s'],
    },
    secret: { type: 'string' },
    redirectUris: {
      type: 'array',
      items: { type: 'string' },
    },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    deletedAt: {
      type: 'string',
      nullable: true,
    },
  },
}

const AppDetail = {
  allOf: [
    { $ref: '#/components/schemas/App' },
    {
      type: 'object',
      properties: {
        scopes: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  ],
}

const PostAppReq = {
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
    scopes: {
      type: 'array',
      items: { type: 'string' },
    },
    redirectUris: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['name', 'type', 'scopes', 'redirectUris'],
}

const PutAppReq = {
  type: 'object',
  properties: {
    redirectUris: {
      type: 'array',
      items: { type: 'string' },
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    isActive: { type: 'boolean' },
    scopes: {
      type: 'array',
      items: { type: 'string' },
    },
  },
}

module.exports = {
  App, AppDetail, PostAppReq, PutAppReq,
}
