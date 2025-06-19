const OrgGroup = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    orgId: { type: 'number' },
    name: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    deletedAt: {
      type: 'string',
      nullable: true,
    },
  },
  required: ['id', 'orgId', 'name', 'createdAt', 'updatedAt', 'deletedAt'],
}

const PostOrgGroupReq = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    orgId: { type: 'number' },
  },
  required: ['name', 'orgId'],
}

const PutOrgGroupReq = {
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

const UserOrgGroup = {
  type: 'object',
  properties: {
    orgGroupId: { type: 'number' },
    orgGroupName: { type: 'string' },
  },
}

module.exports = {
  OrgGroup,
  PostOrgGroupReq,
  PutOrgGroupReq,
  UserOrgGroup,
}
