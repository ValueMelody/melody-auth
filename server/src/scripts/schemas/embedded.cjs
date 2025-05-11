const PostInitiateReq = {
  type: 'object',
  properties: {
    redirectUri: { type: 'string' },
    clientId: { type: 'string' },
    codeChallenge: { type: 'string' },
    codeChallengeMethod: {
      type: 'string',
      enum: ['S256', 'plain'],
    },
    scopes: {
      type: 'array',
      items: { type: 'string' },
    },
    locale: { type: 'string' },
    org: { type: 'string' },
  },
  required: [
    'redirectUri', 'clientId', 'codeChallenge',
    'codeChallengeMethod', 'scopes', 'locale',
  ],
}

module.exports = { PostInitiateReq }
