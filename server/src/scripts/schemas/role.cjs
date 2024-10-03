const Role = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    note: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    deletedAt: {
      type: 'string',
      nullable: true,
    },
  },
  required: ['id', 'name', 'note', 'createdAt', 'updatedAt', 'deletedAt'],
}

const PutRoleReq = {
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

const PostRoleReq = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    note: { type: 'string' },
  },
  required: ['name'],
}

module.exports = {
  Role, PutRoleReq, PostRoleReq,
}
