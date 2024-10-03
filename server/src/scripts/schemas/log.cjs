const EmailLog = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    success: { type: 'boolean' },
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
  required: ['id', 'success', 'receiver', 'response', 'content', 'createdAt', 'updatedAt', 'deletedAt'],
}

const SmsLog = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    success: { type: 'boolean' },
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
  required: ['id', 'receiver', 'response', 'content', 'createdAt', 'updatedAt', 'deletedAt'],
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
  required: ['id', 'userId', 'ip', 'detail', 'createdAt', 'updatedAt', 'deletedAt'],
}

module.exports = {
  EmailLog, SmsLog, SignInLog,
}
