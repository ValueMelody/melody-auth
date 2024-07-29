const Role = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    deletedAt: {
      type: 'string',
      nullable: true,
    },
  },
}

const PutRoleReq = {
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

const PostRoleReq = {
  allOf: [
    { $ref: '#/components/schemas/PutRoleReq' },
  ],
}

module.exports = {
  Role, PutRoleReq, PostRoleReq,
}
