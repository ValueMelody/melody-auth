const EmailLog = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    receiver: { type: 'string' },
    response: { type: 'string' },
    content: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    deletedAt: {
      type: 'string',
      nullable: true,
    },
  },
}

const SmsLog = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    receiver: { type: 'string' },
    response: { type: 'string' },
    content: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    deletedAt: {
      type: 'string',
      nullable: true,
    },
  },
}

const SignInLog = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    userId: { type: 'number' },
    ip: {
      type: 'string', nullable: true,
    },
    detail: {
      type: 'string', nullable: true,
    },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    deletedAt: {
      type: 'string',
      nullable: true,
    },
  },
}

module.exports = {
  EmailLog, SmsLog, SignInLog,
}
