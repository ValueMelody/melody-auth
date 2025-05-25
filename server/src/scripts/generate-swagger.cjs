const fs = require('fs')
const swaggerJsdoc = require('swagger-jsdoc')
const {
  Scope, ScopeDetail, PutScopeReq, PostScopeReq,
} = require('./schemas/scope.cjs')
const {
  Role, PutRoleReq, PostRoleReq,
} = require('./schemas/role.cjs')
const {
  Org, PutOrgReq, PostOrgReq,
} = require('./schemas/org.cjs')
const {
  App, AppDetail, PostAppReq, PutAppReq,
} = require('./schemas/app.cjs')
const {
  User, UserDetail, PutUserReq,
  UserConsentedApp, UserPasskey,
} = require('./schemas/user.cjs')
const {
  EmailLog, SmsLog, SignInLog,
} = require('./schemas/log.cjs')
const {
  UserAttribute, PostUserAttributeReq, PutUserAttributeReq,
} = require('./schemas/userAttribute.cjs')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Melody Auth S2S API',
      version: '0.0.1',
    },
    security: [
      { oauth2: [] },
    ],
    components: {
      securitySchemes: {
        oauth2: {
          type: 'oauth2',
          flows: {
            clientCredentials: {
              tokenUrl: '/oauth2/v1/token',
              scopes: {
                root: 'Full access',
                read_app: 'Read access to app',
                write_app: 'Write access to app',
                read_user: 'Read access to user',
                write_user: 'Write access to user',
                read_role: 'Read access to role',
                write_role: 'Write access to role',
                read_scope: 'Read access to scope',
                write_scope: 'Write access to scope',
                read_org: 'Read access to org',
                write_org: 'Write access to org',
              },
            },
          },
        },
      },
      schemas: {
        Scope,
        ScopeDetail,
        PutScopeReq,
        PostScopeReq,
        Role,
        PutRoleReq,
        PostRoleReq,
        Org,
        PutOrgReq,
        PostOrgReq,
        App,
        AppDetail,
        PostAppReq,
        PutAppReq,
        User,
        UserDetail,
        UserConsentedApp,
        UserAttribute,
        PostUserAttributeReq,
        PutUserAttributeReq,
        UserPasskey,
        PutUserReq,
        EmailLog,
        SmsLog,
        SignInLog,
      },
    },
  },
  apis: [
    './src/routes/scope.tsx',
    './src/routes/role.tsx',
    './src/routes/org.tsx',
    './src/routes/app.tsx',
    './src/routes/user.tsx',
    './src/routes/userAttribute.tsx',
    './src/routes/log.tsx',
  ],
}

const swaggerSpec = swaggerJsdoc(options)

fs.writeFileSync(
  './src/scripts/swagger.json',
  JSON.stringify(
    swaggerSpec,
    null,
    2,
  ),
  'utf-8',
)
